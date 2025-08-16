import { useSession } from 'next-auth/react'

export function useCurrentRole() {
  const sesssion = useSession()
  return sesssion?.data?.user?.role
}
