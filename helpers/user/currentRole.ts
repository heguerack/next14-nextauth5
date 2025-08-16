import { auth } from '@/auth'

export async function currentRole() {
  const session = await auth()
  return session?.user?.role
}
