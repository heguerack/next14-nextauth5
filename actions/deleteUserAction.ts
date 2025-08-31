'use server'

import { signOut } from '@/auth'
import { currentUser } from '@/helpers/user/currentUser'
import { db } from '@/lib/db'

export async function deleteUserAction(id: string) {
  const deleteUser = await db.user.delete({
    where: { id },
  })

  if (!deleteUser) {
    return { error: 'Unable to delete user' }
  }
  await signOut()
}
