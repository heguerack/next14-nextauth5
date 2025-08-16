'use client'

import UserInfo from '@/components/auth/UserInfo'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

export default function clientPage() {
  const user = useGetCurrentUser()

  return (
    <div className=''>
      <UserInfo user={user} label='Client Componet' />
    </div>
  )
}
