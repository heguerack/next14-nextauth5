import { type DefaultSession } from 'next-auth'

// Brad placed this in a next-auth.d.ts file

import { UserRole } from '@prisma/client'

// flow used t inject values to types in nextauth
export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole
  isTwoFactorEnabled: boolean
  isOAuth: boolean
}

declare module 'next-auth' {
  interface Session {
    user?: ExtendedUser
  }
}
