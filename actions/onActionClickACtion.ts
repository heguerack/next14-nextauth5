'use server'

import { currentRole } from '@/helpers/user/currentRole'
import { UserRole } from '@prisma/client'

export async function onActionClickACtion() {
  const role = await currentRole()
  if (role !== UserRole.ADMIN) {
    return null
  }
  return {
    success: { message: 'You can use this Action!' },
  }
}
