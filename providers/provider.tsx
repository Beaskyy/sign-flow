'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider, signOut } from 'next-auth/react'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error: any) => {
              // Don't retry on 401 errors
              if (error?.message?.includes('401')) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            onError: (error: any) => {
              // Handle 401 errors globally
              if (error?.message?.includes('401')) {
                console.log('🔒 Unauthorized - signing out')
                signOut({ callbackUrl: '/login' })
              }
            },
          },
        },
      })
  )

  return (
    <SessionProvider>
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    </SessionProvider>
  )
}