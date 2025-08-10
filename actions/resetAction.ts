'use server'

import { auth } from '@/auth'
import { sendResetEmail } from '@/helpers/mail/mail'
import { ResetSchema } from '@/schemas'
import z from 'zod'
import crypto from 'crypto'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { generatePasswordResetToken } from '@/helpers/data/generatePasswordResetToken'

export async function resetAction(values: z.infer<typeof ResetSchema>) {
  const validatedValues = ResetSchema.safeParse(values)
  // console.log(validatedValues)

  if (!validatedValues.success) {
    return { error: 'Invalid Email' }
  }
  const email = validatedValues.data.email

  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    return { error: 'Not email found to reset your password' }
  }
  const passwordResetToken = await generatePasswordResetToken(
    validatedValues.data.email
  )

  const sendEmail = await sendResetEmail(
    passwordResetToken.email,
    passwordResetToken.passwordToken
  )

  return { success: 'we have sent the email to change password' }
}
