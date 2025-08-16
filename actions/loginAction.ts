'use server'

import { signIn } from '@/auth'
import { generateTwofactorToken } from '@/helpers/data/generateTwofactorToken'
import { generateVerificationToken } from '@/helpers/data/generateVerificationToken'
import { getTwoFactorTokenByEmail } from '@/helpers/data/getTwoFactorToken'
import {
  sendTwoFactorTokenEmail,
  sendVerificationEmail,
} from '@/helpers/mail/mail'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { db } from '@/lib/db'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { LoginSchema } from '@/schemas'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import z from 'zod'

export async function loginAction(
  values: z.infer<typeof LoginSchema>,
  newCallbackUrl?: string
) {
  console.log('newCallbackUrl at loginAction', newCallbackUrl)

  const validatedValues = LoginSchema.safeParse(values)
  if (!validatedValues.success) {
    return { error: 'Invalid Objects' }
  }
  const { email, password, code } = validatedValues.data

  const existingUser = await getUserByEmail(email)
  if (!existingUser) {
    return { error: 'Not user with that email' }
  }

  if (!existingUser?.emailVerified) {
    const verificationToken = await generateVerificationToken(email)
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )
    return { success: 'confirmation email sent!!!' }
  }

  // check first if a twoFactorToken has been generated and is attched to that email
  const token = await getTwoFactorTokenByEmail(email)
  console.log('generatedToken :', token)
  console.log('code :', { code })

  if (token) {
    // if (token && !existingUser.TwoFactorConfirmation) {
    //   await sendTwoFactorTokenEmail(email, token.token)
    // }
    if (token.token !== code?.trim()) {
      return { error: 'Tokens dontmatch!' }
    }
    //check if token is active
    if (token.expires < new Date()) return { error: 'Code expired' }
    // create TwofactorConfirmation in db
    await db.twoFactorConfirmation.create({
      data: {
        userId: existingUser.id,
      },
    })
    // console.log('twofactorConfirmation created')
    // deleting two factor token
    await db.twoFactorToken.deleteMany({
      where: { id: token.id },
    })
  }
  // if user is enabled but not two factor confirmation in place
  // so creat token and send email with token
  //check exitning USing again as it ws probably updated
  const checkExistingUser = await getUserByEmail(email)
  if (!checkExistingUser) return { error: 'Not user with that email' }
  if (
    checkExistingUser.isTwoFactorEnabled &&
    !checkExistingUser.twoFactorConfirmation
  ) {
    console.log('existing user is two factor enabled')
    console.log('existing user is not two factor confirmed')
    console.log(
      'checkingExistingUser.TwoFactorConfirmation :',
      existingUser.twoFactorConfirmation
    )

    const generateToken = await generateTwofactorToken(email)
    // const twoFactorTokenEmailSent = await sendTwoFactorTokenEmail(
    await sendTwoFactorTokenEmail(email, generateToken.token)
    // if (!twoFactorTokenEmailSent) {
    //   return { error: 'coudnt sent email for 2FA' }
    // }

    console.log('email for two factor confirmation')

    return {
      success: 'Enter two factor code',
    }
  }
  try {
    await signIn('credentials', {
      email,
      password,
      // redirectTo: newCallbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
    await db.twoFactorConfirmation.deleteMany({
      where: { userId: existingUser.id },
    })
    redirect(newCallbackUrl ? newCallbackUrl : DEFAULT_LOGIN_REDIRECT)
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
