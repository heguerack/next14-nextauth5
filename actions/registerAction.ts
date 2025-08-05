'use server'

import { RegisterSchema } from '@/schemas'
import z from 'zod'

export async function registerAction(values: z.infer<typeof RegisterSchema>) {
  const validatedValues = RegisterSchema.safeParse(values)
  console.log(values)

  if (!validatedValues) {
    return { error: 'Invalid Values' }
  }
  return {
    success: 'User created successfully',
  }
}
