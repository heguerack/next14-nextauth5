import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './lib/db'
import { getUserById } from './helpers/user/getUserById'
import { UserRole } from '@prisma/client'
import { getTwoFactorConfirmationByUserId } from './helpers/data/getTwofactorConfirmation'
import { accountsActions } from './actions/accountsActions'

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
    async signIn({ user, account }) {
      // aloow OAuth witjhout email verification
      //Althought I odnt think we need it, becasue if social an email will be verifoed one the spot
      if (account?.provider !== 'credentials') return true
      const existingUser = await getUserById(user.id as string)
      //prevent signin without email verification
      if (!existingUser || !existingUser.emailVerified) {
        return false
      }
      // prevent sign in if twofactorAuthenticaton is enabled
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        )
        if (!twoFactorConfirmation) return false
        //Delete twoFactor Confirmation for the next sign in
        // await db.twoFactorToken.delete({
        //   where: { id: twoFactorConfirmation.id },
        // })
      }
      return true
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        // console.log('sessionSession :', session)
        // console.log('sessionToken :', token)
      }
      if (token.userRole && session.user) {
        session.user.role = token.userRole as UserRole
      }
      if (session.user) {
        // seems like i odnt need to reply in adding stuff to the token, i an just bring it here via actions!
        // const user = await getUserById(session.user.id)
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.isOAuth = token.isOAuth as boolean
      }

      return session
    },
    // hover over jwt for options
    async jwt({ token }) {
      console.log('Im being called again')

      // console.log('jwt token :', token)
      // we must return token
      if (!token.sub) return token
      const user = await getUserById(token.sub as string)

      if (!user) return token

      const account = await accountsActions(user.id)
      // so the !! is returnning a boolean, like if ancount return true else false
      token.isOAuth = !!account
      token.email = user.email
      token.name = user.name
      token.userRole = user.role
      token.isTwoFactorEnabled = user.isTwoFactorEnabled
      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
