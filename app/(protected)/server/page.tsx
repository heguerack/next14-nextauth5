import UserInfo from '@/components/auth/UserInfo'
import { currentUser } from '@/helpers/user/currentUser'

export default async function serverPage() {
  const user = await currentUser()
  return <UserInfo user={user} label='Server Component' />
}
