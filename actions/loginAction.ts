'use server'

import { signIn } from '@/auth'
import { generateVerificationToken } from '@/helpers/data/generateVerificationToken'
import { sendVerificationEmail } from '@/helpers/mail/mail'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { LoginSchema } from '@/schemas'
import { AuthError } from 'next-auth'
import z from 'zod'

export async function loginAction(values: z.infer<typeof LoginSchema>) {
  const validatedValues = LoginSchema.safeParse(values)
  if (!validatedValues.success) {
    return { error: 'Invalid Objects' }
  }
  const { email, password } = validatedValues.data

  const existingUser = await getUserByEmail(email)
  if (!existingUser?.emailVerified) {
    const verificationToken = await generateVerificationToken(email)
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )

    return { success: 'confirmation email sent' }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    })

    return { success: 'Use Logged in successfully' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid Credentails!' }
        default:
          return { error: error.type }
      }
    }
    // we just have to thwo this error, nextjsn requires it, not sure why
    throw error
  }
}
