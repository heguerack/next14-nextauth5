'use client'

import { onActionClickACtion } from '@/actions/onActionClickACtion'
import RoleGate from '@/components/auth/RoleGate'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { UserRole } from '@prisma/client'
import { useState } from 'react'

export default function page() {
  const [allowApi, setAllowApi] = useState<boolean | null>(null)
  const [allowAction, setAllowAction] = useState<boolean | null>(null)
  const onApiClick = () => {
    fetch('/api/admin').then((res) => {
      if (res.ok) {
        console.log('response is ok')
        setAllowApi(true)
      } else {
        console.error('FORBIDDEN')
        setAllowApi(false)
      }
    })
  }

  const onActionClick = async () => {
    const res = await onActionClickACtion()
    if (res?.success) {
      setAllowAction(true)
    } else {
      setAllowAction(false)
    }
  }
  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-2xl font-semibold text-center '>🔑 Admin</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message='you are allowed to see this content!' />
        </RoleGate>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-md'>
          <div className=''>
            <p className='text-sm font-medium'>Admin-only API Route</p>

            {allowApi && (
              <FormSuccess message='You are allowed to use /api/admin/route.ts!' />
            )}
            {allowApi === false && (
              <FormError message='You are NOT allowed to use /api/admin/route.ts!' />
            )}
          </div>
          <Button onClick={onApiClick}>Click to test </Button>
        </div>

        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-md'>
          <div className=''>
            <p className='text-sm font-medium'>Admin-only Server Action</p>
            {allowAction && (
              <FormSuccess message='You are allowed to use this action!!' />
            )}
            {allowAction === false && (
              <FormError message='You are NOT allowed to use this action' />
            )}
          </div>
          <Button onClick={onActionClick}>Click to test </Button>
        </div>
      </CardContent>
    </Card>
  )
}
