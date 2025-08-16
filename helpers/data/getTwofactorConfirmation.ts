import { db } from '@/lib/db'

export async function getTwoFactorConfirmationByUserId(userId: string) {
  try {
    const twofatorConfirmation = await db.twoFactorConfirmation.findUnique({
      where: { userId },
    })
    return twofatorConfirmation
  } catch (error) {
    null
  }
}
