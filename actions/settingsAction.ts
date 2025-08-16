'use server'

import { currentUser } from '@/helpers/user/currentUser'
import { getUserById } from '@/helpers/user/getUserById'
import { db } from '@/lib/db'
import { SettingsSchema } from '@/schemas'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { generateVerificationToken } from '@/helpers/data/generateVerificationToken'
import { sendVerificationEmail } from '@/helpers/mail/mail'
import { revalidatePath } from 'next/cache'

export async function settingsAction(values: z.infer<typeof SettingsSchema>) {
  const validatedValues = SettingsSchema.safeParse(values)
  if (!validatedValues.success) {
    return { error: 'Invalid Values' }
  }
  const { name, password, newPassword, isTwoFactorEnabled, email, role } =
    validatedValues.data

  const user = await currentUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  // is this becasue we can have an user in a session but posibly in db?
  const dbUser = await getUserById(user.id as string)
  console.log('dbUser :', dbUser)
  if (!dbUser) {
    return { error: 'Unauthorized' }
  }

  // check if user is OAuth
  //desable OAuth users
  if (user.isOAuth) {
    values.email = undefined
    values.password = undefined
    values.newPassword = undefined
    values.isTwoFactorEnabled = undefined
  }

  // check if email you are tring to change is taken
  if (email && email !== dbUser.email) {
    const existingUser = await getUserById(email)
    //if user exists and that user isnt us then error
    if (existingUser && existingUser.id !== user.id) {
      return { error: 'That email has been taken already' }
    }
    const verificationToken = await generateVerificationToken(email)
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )
    //And we have to break it here  because they have to getVerifed first
    //but we shoudnt break herre cuz we need the rest of the logic!!
    // return { success: 'Verification Emial Sent' }

    //what i gotta do is update the user to email not verified
    await db.user.update({
      where: { id: user?.id },
      data: { emailVerified: null },
    })
  }

  //check passwords
  let hashedNewPassword = null
  if (password || newPassword) {
    const passwordmatch = await bcrypt.compare(password!, dbUser.password!)

    if (!passwordmatch) {
      return { error: 'Current password is incorrect' }
    }

    hashedNewPassword = await bcrypt.hash(newPassword!, 10)
    if (!hashedNewPassword) {
      return { error: 'Current password is incorrect' }
    }
  }

  await db.user.update({
    where: { id: dbUser?.id },
    data: {
      name,
      email,
      isTwoFactorEnabled,
      role,
      password:
        hashedNewPassword === null ? dbUser.password : hashedNewPassword,
    },
  })
  revalidatePath('/admin')
  return { success: 'Settings Updated!' }
}
