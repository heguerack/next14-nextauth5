import { db } from '@/lib/db'

export async function getTwoFactorTokenByToken(token: string) {
  try {
    const twofatcorToken = await db.twoFactorToken.findUnique({
      where: { token: token },
    })
    return twofatcorToken
  } catch (error) {
    null
  }
}

export async function getTwoFactorTokenByEmail(email: string) {
  try {
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: { email },
    })
    return twoFactorToken
  } catch (error) {
    null
  }
}
