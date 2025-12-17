'use client'

import { useProfile } from '@/hooks/useProfile'

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>{profile?.email}</p>
    </div>
  )
}