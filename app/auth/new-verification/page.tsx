'use client'

import { newVerificationTokenAction } from '@/actions/newVerificationTokenAction'
import { CardWrapper } from '@/components/auth/CardWrapper'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'

export default function newVerificationPage() {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const token = useSearchParams().get('token')

  // so basically this logic is as folows: on Submit run at the start due to useaEffect. on submit also runs if onSubmit changes. and onSubmit changes if the token changes
  const onSubmit = useCallback(() => {
    if (!token) {
      setError('Missing token')
      return
    }

    newVerificationTokenAction(token)
      .then((data) => {
        setSuccess(data.success)
        setError(data.error)
      })
      .catch((error) => {
        setError('Somethig went wrong')
      })
  }, [token])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  return (
    <CardWrapper
      headerLabel='Confirming your verification'
      backButtonLabel='Back to login'
      backButtonHref='auth/login'>
      <div className='flex items-center w-full justify-center'>
        {!success && !error && <BeatLoader />}

        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </CardWrapper>
  )
}
