'use client'

import { signOut } from 'next-auth/react'

interface LoginButtonProps {
  children?: React.ReactNode
}

export const LogoutButton = ({ children }: LoginButtonProps) => {
  const onClick = () => {
    signOut()
  }

  return (
    <span onClick={onClick} className='cursor-pointer'>
      {children}
    </span>
  )
}
