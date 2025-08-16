import ProtectedNavbar from './ProtectedNavbar'

export default function protectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='h-full w-full flex flex-col gap-y-10 pt-16 items-center justify-start bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800'>
      <ProtectedNavbar />
      {children}
    </div>
  )
}
