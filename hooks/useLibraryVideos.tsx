'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

export interface LibraryVideo {
  id: string
  gloss: string
  region: string
  video_url: string
  is_processed: boolean
  added_by_email: string
  created_at: string
}

export interface LibraryVideoDetail extends LibraryVideo {
  file_size: number
  pose_keypoints: string | null // GZIP-Base64 string
  extracted_at: string | null
  updated_at: string
}

interface LibraryVideosResponse {
  count: number
  total_pages: number
  current_page: number
  results: LibraryVideo[]
}

export function useLibraryVideos(params: {
  page?: number
  page_size?: number
  search?: string
  is_processed?: boolean
  region?: string
} = {}) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const queryParams = new URLSearchParams()
  if (params.page) queryParams.set('page', params.page.toString())
  if (params.page_size) queryParams.set('page_size', params.page_size.toString())
  if (params.search) queryParams.set('search', params.search)
  if (params.is_processed !== undefined) queryParams.set('is_processed', params.is_processed.toString())
  if (params.region) queryParams.set('region', params.region)

  const queryString = queryParams.toString()
  const endpoint = `/translation/admin/library-videos/${queryString ? `?${queryString}` : ''}`

  return useQuery({
    queryKey: ['library-videos', params],
    queryFn: () => apiClient<LibraryVideosResponse>(endpoint, token),
    enabled: !!token,
  })
}

export function useLibraryVideoDetail(id: string) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useQuery({
    queryKey: ['library-videos', id],
    queryFn: () => apiClient<LibraryVideoDetail>(`/translation/admin/library-videos/${id}/`, token),
    enabled: !!token && !!id,
  })
}

export function useDeleteLibraryVideo() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient(`/translation/admin/library-videos/${id}/`, token, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-videos'] })
    }
  })
}
