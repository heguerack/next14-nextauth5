// 'use client'
import { useSession } from 'next-auth/react'

export function useGetCurrentUser() {
  const session = useSession()

  return session?.data?.user
}
