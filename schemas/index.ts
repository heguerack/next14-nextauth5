import { UserRole } from '@prisma/client'
import * as z from 'zod'
// import { UserRole } from "@prisma/client";
//optiona becasue we give the chance fpr the user to change whatver they want really
export const SettingsSchema = z
  .object({
    name: z.optional(
      z.string().min(2, 'Name must be at least 2 characters long')
    ),
    isTwoFactorEnabled: z.optional(z.boolean()),
    email: z.optional(z.email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false
      }

      return true
    },
    {
      message: 'New password is required!',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false
      }

      return true
    },
    {
      message: 'Password is required!',
      path: ['password'],
    }
  )
// .refine(
//   (data) => {
//     if (data.name) {
//       if (data.name.length < 3) {
//         return false
//       }
//     }
//     return true
//   },
//   {
//     message: 'name must be longer than 3!',
//     path: ['name'],
//   }
// )

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Minimum of 6 characters required',
  }),
})

export const ResetSchema = z.object({
  email: z.email({
    message: 'Email is required',
  }),
})

export const LoginSchema = z.object({
  email: z.email({
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
  code: z.optional(z.string()),
})

export const RegisterSchema = z.object({
  email: z.email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  name: z.string().min(2, {
    message: 'Name is required',
  }),
  // role: z.enum(['USER', 'ADMIN']),
})
