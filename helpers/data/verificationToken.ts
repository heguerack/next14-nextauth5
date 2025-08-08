import { db } from '@/lib/db'

export async function getVerificationTokenByEmail(email: string) {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    })
    return verificationToken
  } catch (error) {
    null
  }
}

export async function getVerificationTokenByToken(token: string) {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { token },
    })
    return verificationToken
  } catch (error) {
    null
  }
}
