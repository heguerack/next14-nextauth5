'use server'

import { db } from '@/lib/db'

export async function accountsActions(userId: string) {
  try {
    const account = await db.account.findFirst({
      where: { userId: userId },
    })
    return account
  } catch (error) {
    null
  }
}
