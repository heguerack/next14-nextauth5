import { db } from '@/lib/db'

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id: id },
      include: { TwoFactorConfirmation: true },
    })
    return user
  } catch (error) {
    return null
  }
}
