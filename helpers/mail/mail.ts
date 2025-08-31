import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const domain = process.env.NEXT_AUTH_URL

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Confirm your email',
    html: ` <p className=''>
        <a href='${confirmLink}'>here</a> to confirm email.
      </p>`,
  })
}

export const sendResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your password',
    html: ` <p className=''>
        <a href='${resetLink}'>here</a> to reset password.
      </p>`,
  })
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: '2FA Code',
    html: ` <p className=''>
        This is your setet 2FA ${token}
      </p>`,
  })

  console.log(`email for 2FA sent to${email}`)
}
