'use server'

import { signIn } from '@/auth'
import { generateTwofactorToken } from '@/helpers/data/generateTwofactorToken'
import { generateVerificationToken } from '@/helpers/data/generateVerificationToken'
import { getTwoFactorConfirmationByUserId } from '@/helpers/data/getTwofactorConfirmation'
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
  callbackUrl?: string | null
) {
  console.log('newCallbackUrl at loginAction', callbackUrl)

  const validatedValues = LoginSchema.safeParse(values)
  if (!validatedValues.success) {
    return { error: 'Invalid Objects' }
  }

  //data
  const { email, password, code } = validatedValues.data

  const existingUser = await getUserByEmail(email)

  //-  check if exisitingUser
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Not user with that email' }
  }

  // check if exsinting user is emailVerified
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email as string
    )
    // if not sent send verification email
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )
    return { success: 'confirmation email sent!!!' }
  }

  //so the previous was basically just checking user and email verification

  // if user is 2FAEnabled
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    // if code, get the 2 factor conformation then
    if (code) {
      console.log('code ', code)

      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)
      console.log('twoFactorToken :', twoFactorToken?.token)

      if (!twoFactorToken) {
        return { error: 'cant get 2FA token with that code!' }
      }

      if (twoFactorToken.token !== code) {
        return { error: 'Invalid code!' }
      }

      const has2FATokenExpired = new Date(twoFactorToken.expires) < new Date()

      if (has2FATokenExpired) {
        return { error: 'Code expired!' }
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      })

      //check if confirmation exist and delte, not sure about this one!!
      // ok, it seems if we get this far there shoudnt be one
      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      )
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        })
      }

      //create toefactor conformation
      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      })
    } else {
      // if NOT code, generate the twoFActorToken then
      const twoFactorToken = await generateTwofactorToken(existingUser.email)
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)
      // not sure ehre, got it, i was doing this with a string repy, this way looks more pro and reusable though
      return { twoFactor: true }
    }
  }

  // IF ALL CHECKS WENT OK< THEN SIGN IN
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid Credentails!' }
        default:
          return { error: 'Something went wrong at login for default error!' }
      }
    }
    // we just have to thwo this error, nextjsn requires it, not sure why
    throw error
  }
}
