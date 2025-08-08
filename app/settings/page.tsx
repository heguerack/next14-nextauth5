import { auth, signOut } from '@/auth'

export default async function page() {
  const session = await auth()

  return (
    <div>
      {JSON.stringify(session)}
      <form
        action={async () => {
          'use server'
          await signOut()
        }}>
        <button>Sign out</button>
      </form>
    </div>
  )
}
