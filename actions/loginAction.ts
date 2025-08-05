'use server'

import { LoginSchema } from '@/schemas'
import z, { safeParse } from 'zod'

export async function loginAction(values: z.infer<typeof LoginSchema>) {
  const validatedValues = LoginSchema.safeParse(values)
  if (validatedValues) {
    return { error: 'Invalid Objects' }
  }
  return {
    success: 'User logged in successfully',
  }
}
