import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import { getPasswordResetTokenByEmail } from './getPasswordResetToken'

export async function generatePasswordResetToken(email: string) {
  const token = uuidv4()
  // expires in one hour
  const expires = new Date(new Date().getTime() + 60 * 60 * 100)
  // check if existingToken
  const tokenExists = await getPasswordResetTokenByEmail(email)

  if (tokenExists) {
    const removeToken = await db.passwordResetToken.delete({
      where: { id: tokenExists.id },
    })
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: { email, passwordToken: token, expires },
  })

  return passwordResetToken
}
