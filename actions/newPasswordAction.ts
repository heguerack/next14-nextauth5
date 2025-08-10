'use server'

import { db } from '@/lib/db'
import { NewPasswordSchema } from '@/schemas'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { getVerificationTokenByToken } from '@/helpers/data/getVerificationToken'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'

export async function newPasswordAction(
  values: z.infer<typeof NewPasswordSchema>,
  token?: string
) {
  if (!token) return { error: 'Missing token at newPasswordAction!' }

  const validatedValues = NewPasswordSchema.safeParse(values)
  if (!validatedValues.success) {
    return { error: 'Invalid Values' }
  }

  console.log(values.password, token)

  //check if token exists
  const existingToken = await getVerificationTokenByToken(token)
  if (!existingToken) return { error: 'we coudlt find the token in database' }

  // check if token has expired
  const hasExpired = new Date(existingToken.expires) < new Date()
  if (hasExpired) return { error: 'token has expired' }

  // now check if user exist before trying to update
  const existingUser = await getUserByEmail(existingToken.email)
  if (!existingUser) return { error: 'User with that email does not exist' }

  const passsword = validatedValues.data.password

  const hashedPassword = await bcrypt.hash(passsword, 10)

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  })

  // now lets delete the unused token
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  })

  return { success: 'Password updated' }
}
