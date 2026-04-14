'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

/** Lightweight video summary returned by the list endpoint */
interface LibraryVideo {
  id: string
  gloss: string
  region: string
  video_url: string
  is_processed: boolean
  added_by_email: string
  created_at: string
}

/** Full video detail (includes heavy pose_keypoints) */
interface LibraryVideoDetail extends LibraryVideo {
  file_size: number
  pose_keypoints: string | null // GZIP-Base64 compressed string
  extracted_at: string | null
  updated_at: string
}

/** Paginated list response shape (auto-unwrapped from { success, data }) */
interface LibraryVideosPage {
  count: number
  total_pages: number
  current_page: number
  results: LibraryVideo[]
}

/** Query params for the list endpoint */
interface LibraryVideosParams {
  page?: number
  page_size?: number
  search?: string
  is_processed?: boolean
  region?: string
}

/* -------------------------------------------------------------------------- */
/*                               List (paginated)                             */
/* -------------------------------------------------------------------------- */

export function useLibraryVideos(params: LibraryVideosParams = {}) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['library-videos', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set('page', String(params.page))
      if (params.page_size) searchParams.set('page_size', String(params.page_size))
      if (params.search) searchParams.set('search', params.search)
      if (params.is_processed !== undefined) searchParams.set('is_processed', String(params.is_processed))
      if (params.region) searchParams.set('region', params.region)

      const qs = searchParams.toString()
      const url = `/translation/admin/library-videos/${qs ? `?${qs}` : ''}`

      return apiClient<LibraryVideosPage>(url, token)
    },
    enabled: !!token,
  })
}

/* -------------------------------------------------------------------------- */
/*                            Single video detail                             */
/* -------------------------------------------------------------------------- */

export function useLibraryVideoDetail(videoId: string) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['library-videos', videoId],
    queryFn: () => apiClient<LibraryVideoDetail>(
      `/translation/admin/library-videos/${videoId}/`,
      token
    ),
    enabled: !!token && !!videoId,
  })
}

/* -------------------------------------------------------------------------- */
/*                          Edit / Update a video                             */
/* -------------------------------------------------------------------------- */

interface UpdateLibraryVideoRequest {
  id: string
  gloss?: string
  region?: string
  video?: File
}

export function useUpdateLibraryVideo() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateLibraryVideoRequest) => {
      const formData = new FormData()
      if (data.gloss) formData.append('gloss', data.gloss)
      if (data.region) formData.append('region', data.region)
      if (data.video) formData.append('video', data.video)

      return apiClient<LibraryVideoDetail>(
        `/translation/admin/library-videos/${id}/`,
        token,
        {
          method: 'PATCH',
          body: formData,
        }
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['library-videos'] })
      queryClient.invalidateQueries({ queryKey: ['library-videos', variables.id] })
    },
  })
}

/* -------------------------------------------------------------------------- */
/*                             Delete a video                                 */
/* -------------------------------------------------------------------------- */

export function useDeleteLibraryVideo() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient(
        `/translation/admin/library-videos/${id}/`,
        token,
        { method: 'DELETE' }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-videos'] })
    },
  })
}