'use client'

import { settingsAction } from '@/actions/settingsAction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useTransition } from 'react'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'
import { SettingsSchema } from '@/schemas'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

import { Switch } from '@/components/ui/switch'
import { FormError } from '@/components/form-error'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserRole } from '@prisma/client'

export default function settingsPage() {
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [fetchUser, setFetchUser] = useState<Object | null>(null)
  const user = useGetCurrentUser()

  console.log('user at settingsuser :', user)

  const [isPending, startTransition] = useTransition()

  const { update, data, status } = useSession()

  const onSubmit = async (values: z.infer<typeof SettingsSchema>) => {
    setError('')
    setSuccess('')
    startTransition(() => {
      settingsAction(values)
        .then((res) => {
          if (res.error) {
            setError(res.error)
          }
          if (res.success) {
            update()
              .then((mango) => {
                if (mango) {
                  console.log(mango.user)
                } else {
                  console.log('No mango error')
                }
              })
              .catch((mangoError) => {
                console.log(mangoError)
              })
            setSuccess(res.success)
          }
        })
        .catch(() => setError('Soemthign went wrong'))
    })
  }

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled ?? false,
      password: undefined,
      newPassword: undefined,
      role: user?.role || undefined,
    },
  })

  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-2xl font-semibold text-center flex items-center justify-center gap-4'>
          <Settings />
          Settings
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='columns-1space-y-6'
            onSubmit={form.handleSubmit(onSubmit)}>
            <div className='space-y-4'>
              <FormField
                disabled={isPending}
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder='Full Name'
                        type='text'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <SelectTrigger
                          className={
                            field.value === UserRole.ADMIN
                              ? 'text-green-600 font-semibold'
                              : field.value === UserRole.USER
                              ? 'text-red-600 font-semibold'
                              : ''
                          }>
                          <SelectValue placeholder='select arole' />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                        <SelectItem value={UserRole.USER}>User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user?.isOAuth == false && (
                <>
                  <FormField
                    disabled={isPending}
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder='john.doe@example.com'
                            type='email'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isPending}
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder='******'
                            type='password'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isPending}
                    control={form.control}
                    name='newPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder='******'
                            type='password'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='isTwoFactorEnabled'
                    render={({ field }) => (
                      <FormItem className='flex items-center justify-between'>
                        <FormLabel>Two-Factor Authentication</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value} // boolean in
                            onCheckedChange={field.onChange} // boolean out
                            disabled={isPending}
                            className='data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <Button disabled={isPending} className='mt-8'>
              {isPending ? 'updating ...' : 'Update fields'}
            </Button>
          </form>
        </Form>
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
      </CardContent>
    </Card>
  )
}
