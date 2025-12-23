'use client'

import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

interface TextToSignRequest {
  text: string
  conversation_id?: string
}

interface TextToSignResponse {
  translation_id: string
  text_input: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  message: string
  websocket: string
  conversation_id: string
  conversation_message_id: string
}

export function useTextToSign() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  return useMutation({
    mutationFn: async (data: TextToSignRequest) => {
      console.log('📤 API Request:', data);
      return apiClient<TextToSignResponse>(
        '/api/translations/text-to-sign/',
        token,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },
  })
}