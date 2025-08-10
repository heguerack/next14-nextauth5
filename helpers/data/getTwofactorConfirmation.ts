import { db } from '@/lib/db'

export async function getTwoFactorConfirmationByUserId(userId: string) {
  try {
    const twofatorConfirmation = await db.TwoFactorConfirmation.findUnique({
      where: { userId },
    })
    return twofatorConfirmation
  } catch (error) {
    null
  }
}
