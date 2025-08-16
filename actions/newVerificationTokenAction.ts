'use server'

import { getVerificationTokenByToken } from '@/helpers/data/getVerificationToken'

import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { db } from '@/lib/db'

export async function newVerificationTokenAction(token: string) {
  console.log('passing token :', token)

  const existingToken = await getVerificationTokenByToken(token)
  console.log('existingToken  :', token)

  if (!existingToken) {
    return { error: 'tokendoes not exist' }
  }

  const hasExpired = new Date(existingToken.expires) < new Date()
  if (hasExpired) {
    return { error: 'Token has expired!' }
  }

  const existingUser = await getUserByEmail(existingToken.email)

  if (!existingUser) {
    return { error: 'Email does not exist' }
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      // this line if the user wats to change thir email, not sure about the logic , later maybe
      email: existingToken.email,
    },
  })

  //remove token after
  await db.verificationToken.delete({
    where: { id: existingToken.id },
  })

  return { success: 'Email verified!' }
}
