'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { LoginSchema } from '@/schemas'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Button } from '@/components/ui/button'
import { CardWrapper } from './CardWrapper'
import { FormError } from '../form-error'
import { FormSuccess } from '../form-success'
import { loginAction } from '@/actions/loginAction'

export const LoginForm = () => {
  const searchParams = useSearchParams()
  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? 'Another account already exists with the same e-mail address, maybe a cosial account withe same email'
      : ''
  const emailVerified = searchParams.get('verifiedMessage')
  const callbackUrl = searchParams.get('callbackUrl')
  console.log('callbackURL :', callbackUrl)

  let newCallbackUrl: string | null
  callbackUrl?.startsWith('auth')
    ? (newCallbackUrl = null)
    : (newCallbackUrl = callbackUrl)

  console.log('newCallbackUrl :', newCallbackUrl)

  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      code: '',
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('')
    setSuccess('')
    startTransition(() => {
      loginAction(values, newCallbackUrl as string).then((res) => {
        if (res?.error) {
          setError(res.error)
        }
        if (res?.success) {
          setSuccess(res.success)
          if (res.success === 'Enter two factor code') {
            setShowTwoFactor(true)
          }
        }
      })
    })
  }

  return (
    <CardWrapper
      headerLabel='Welcome back'
      backButtonLabel="Don't have an account?"
      backButtonHref='/auth/register'
      showSocial>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            {showTwoFactor && (
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder='123456'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                    <Button
                      disabled={isPending}
                      size='sm'
                      variant='link'
                      asChild
                      className='px-0 font-normal'>
                      <Link href='/auth/reset'>Forgot password?</Link>
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          {emailVerified && <FormSuccess message={emailVerified} />}

          <Button disabled={isPending} type='submit' className='w-full'>
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
