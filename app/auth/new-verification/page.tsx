import { getVerificationTokenByToken } from '@/helpers/data/verificationToken'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { db } from '@/lib/db'
import Link from 'next/link'
import { redirect, useSearchParams } from 'next/navigation'
type pagePros = {
  searchParams: { token?: string }
}

export default async function newVerificationPage({ searchParams }: pagePros) {
  const paramToken = await searchParams.token
  console.log('paramToken :', paramToken)
  if (!paramToken) {
    // handle missing token however you want
    redirect('/auth/error?code=missing_token')
  }

  const tokenExists = await getVerificationTokenByToken(paramToken)

  if (tokenExists) {
    const user = await getUserByEmail(tokenExists.email)
    if (!user) {
      return (
        <div>
          <h1>User does not exist</h1>
          try a to register again
        </div>
      )
    }

    const verifiedUser = await db.user.update({
      where: { id: user?.id },
      data: {
        ...user,
        emailVerified: new Date(),
      },
    })
    console.log(verifiedUser)

    if (verifiedUser) {
      await db.verificationToken.delete({
        where: { token: paramToken },
      })
      redirect(
        `/login?verifiedMessage=${encodeURIComponent('Successfully Verified')}`
      )
    }
  }
  return (
    <div>
      <h1>Verifitaction token expired</h1>
      Try to login again to get a new verification token
      <Link href={'/login'}>Log in page</Link>
    </div>
  )
}
