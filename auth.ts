import NextAuth, { type DefaultSession } from 'next-auth'
import authConfig from '@/auth.config'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './lib/db'
import { getUserById } from './helpers/user/getUserById'
import { UserRole } from '@prisma/client'

// Brad placed this in a next-auth.d.ts file
// flow used t inject values to types in nextauth
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: 'ADMIN' | 'USER'
    }
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
  callbacks: {
    // hover over session to see options
    async session({ token, session, user }) {
      // we must return session
      // console.log('session from callback session :', session)
      // console.log('session token:', token)
      // if (session.user) {
      //   session.user. = token.customField
      // }
      if (token.sub && session.user) {
        session.user.id = token.sub
        console.log('sessionSession :', session)
        console.log('sessionToken :', token)
      }
      if (token.userRole && session.user) {
        session.user.role = token.userRole as UserRole
      }

      return session
    },
    // hover over jwt for options
    async jwt({ token }) {
      console.log('jwt token :', token)

      // we must return token
      // token.customField = 'test'
      // so to add the id to the session , we can just grab the sub from token in session
      // now lets add the role, to do that we need to use our action to grab the user from there, as we cant really access user info in the token, not sure why, still trying to figure out things in detail
      if (!token.sub) return token
      const user = await getUserById(token.sub as string)
      if (!user) return token
      token.userRole = user?.role
      return token
    },
    async signIn({ user, account }) {
      // aloow OAuth witjhout email verification
      //Althought I odnt think we need it, becasue if social an email will be verifoed one the spot
      if (account?.provider !== 'credentials') return true
      const existingUser = await getUserById(user.id)
      //prevent signin without email verification
      if (!existingUser || !existingUser.emailVerified) {
        return false
      }

      return true
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
