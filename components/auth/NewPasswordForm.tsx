'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

import { NewPasswordSchema } from '@/schemas'
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
import { CardWrapper } from '@/components/auth/CardWrapper'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'
import { newPasswordAction } from '@/actions/newPasswordAction'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPasswordResetTokenByToken } from '@/helpers/data/getPasswordResetToken'

export default function NewPasswordForm() {
  const [success, setSuccess] = useState<string | undefined>('')
  const [error, setError] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()

  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    console.log('Clicked submit')

    setError('')
    setSuccess('')
    startTransition(() => {
      newPasswordAction(values, token)
        .then((res) => {
          setError(res.error)
          setSuccess(res.success)
        })
        .catch(() => {
          setError('Something went wrong')
        })
    })
  }

  return (
    <CardWrapper
      headerLabel='Enter a new password?'
      backButtonLabel='Back to login'
      backButtonHref='/auth/login'
      // showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            <>
              <FormField
                disabled={isPending}
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder='Enter your new password'
                        type='password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />

          <Button disabled={isPending} type='submit' className='w-full'>
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
