import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { ExtendedUser } from '@/next-auth-d'

// so basically this is a way to etnd our types, i guess we could have extended the  zodschemas too. many ways of doing things seem like.
interface UserInfoProps {
  user?: ExtendedUser
  label: string
}

export default function UserInfo({ user, label }: UserInfoProps) {
  console.log('userInfo: ', user)

  return (
    <Card>
      <CardHeader>
        <p className='text-2xl font-semibold text-center'>{label}</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-16 flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>ID</p>
          <p className='truncate text-xs  font-mono p-1 bg-slate-100 rounded-md '>
            {user?.id}
          </p>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Name</p>
          <p className='truncate text-xs  font-mono p-1 bg-slate-100 rounded-md '>
            {user?.name}
          </p>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Email</p>
          <p className='truncate text-xs  font-mono p-1 bg-slate-100 rounded-md '>
            {user?.email}
          </p>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Role</p>
          <p className='truncate text-xs  font-mono p-1 bg-slate-100 rounded-md '>
            {user?.role}
          </p>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>TFA</p>
          <Badge variant={user?.isTwoFactorEnabled ? 'success' : 'destructive'}>
            {user?.isTwoFactorEnabled ? 'ON' : 'OFF'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
