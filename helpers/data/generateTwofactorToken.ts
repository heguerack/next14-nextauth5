import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { getTwoFactorTokenByEmail } from './getTwoFactorToken'
import { getUserByEmail } from '../user/getUserByEmail'

export async function generateTwofactorToken(email: string) {
  // const token = uuidv4()
  // we wont use this one now, i guess its for ercurity purposes that we use crypto as it gives usa very stro code or passwrd

  const token = crypto.randomInt(100_000, 1_000_000) // the _ just lets us read easily
  //reduce to 15 minuts or so, after development
  const expires = new Date(new Date().getTime() + 3600 * 100) // this will gives us a 6 digit code not getting into a million

  // check if the twofactor token exists
  const existingToken = await getTwoFactorTokenByEmail(email)

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: { id: existingToken.id },
    })
  }

  //create token
  const twofactorToken = await db.twoFactorToken.create({
    data: { email, token: token.toString(), expires },
  })

  return twofactorToken
}
