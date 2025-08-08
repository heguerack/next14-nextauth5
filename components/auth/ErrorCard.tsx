import { FaExclamationTriangle } from 'react-icons/fa'
import { CardWrapper } from './CardWrapper'

export default function ErrorCard() {
  return (
    <CardWrapper
      headerLabel='Opps! Somehting went wrong'
      backButtonLabel='Back to login'
      backButtonHref='"/auth/login'>
      <div className='w-full flex justify-center items-center'>
        <FaExclamationTriangle className='text-destructive ' />
      </div>
    </CardWrapper>
  )
}
