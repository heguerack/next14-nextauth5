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
  console.log('getTokenByToken:', token)

  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { token },
    })
    console.log('foundTokenByToken:', verificationToken)
    return verificationToken
  } catch (error) {
    null
  }
}
