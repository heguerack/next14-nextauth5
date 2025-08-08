import { v4 as uuidv4 } from 'uuid'
import { getVerificationTokenByEmail } from './verificationToken'
import { db } from '@/lib/db'

export async function generateVerificationToken(email: string) {
  const token = uuidv4()
  // expires in one hour
  const expires = new Date(new Date().getTime() + 3600 * 100)
  // check if existingToken
  const tokenExists = await getVerificationTokenByEmail(email)
  if (tokenExists) {
    const removeToken = await db.verificationToken.delete({
      // we could also say:where:{email}
      // bI think the logic is the same, maybe we must remove with an id, niot just anyother property. even if that other property is unique, like email is in this project.
      where: { id: tokenExists.id },
    })
  }
  const verificationToken = await db.verificationToken.create({
    data: { email, token, expires },
  })
  return verificationToken
}
