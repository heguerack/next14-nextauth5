import { auth } from '@/auth'
import NewPasswordForm from '@/components/auth/NewPasswordForm'

export default function page() {
  const session = auth()
  // const user = session?.user
  return <NewPasswordForm />
}
