'use server'

import { db } from '@/lib/db'
import { RegisterSchema } from '@/schemas'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'

export async function registerAction(values: z.infer<typeof RegisterSchema>) {
  const validatedValues = RegisterSchema.safeParse(values)
  // console.log(values)

  if (!validatedValues.success) {
    return { error: 'Invalid Values' }
  }
  const { email, password, name } = validatedValues.data

  // const userExists = await db.user.findUnique({
  //   where: { email: email },
  // })

  const userExists = await getUserByEmail(email)

  if (userExists) {
    return { error: 'User email has already been used' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const createUser = await db.user.create({
    data: { ...values, password: hashedPassword },
  })

  if (!createUser) {
    return { error: 'Unable to creat user' }
  }

  return {
    success: 'User created successfully',
  }
}
