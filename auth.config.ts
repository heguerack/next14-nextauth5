import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { LoginSchema } from './schemas'
import { getUserByEmail } from './helpers/user/getUserByEmail'
import bcrypt from 'bcryptjs'

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFileds = LoginSchema.safeParse(credentials)
        if (validatedFileds.success) {
          const { email, password } = validatedFileds.data
          // check if user exists
          const user = await getUserByEmail(email)
          // this because if not user or if user but user does not have a [pasword. becuase they probably signed up with  say google or a diferent way
          if (!user || !user.password) return null
          // user.password because thast the hasshedPassword cming back
          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (passwordsMatch) return user
        }
        return null
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig
