# Franks Notes

## SETUP

### npx create-next-app@14.0.4

- lets work with this version. All dependencies should be the same to avoid issues

### Install or init shadcn

- `https://ui.shadcn.com/docs/installation/next`
- `npx shadcn@latest init`
- select newyor for styles and base color = slate
- no tailwind configurations needed
- We can proceed and install all shadcn componets fro now, so w that we dont have to install one by one, we can remove the leftovers after.
- `npx shadcn@latest add --all`

## HOMEPAGE

- but first lest just add this to gloabals.css

```ts
html,
body,
:root {
  height: 100%;
}

@layer base {
  :root {...
```

```ts
import { Poppins } from 'next/font/google'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LoginButton } from '@/components/auth/LoginButton'

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
})

export default function Home() {
  return (
    <main className='flex h-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800'>
      <div className='space-y-6 text-center'>
        <h1
          className={cn(
            'text-6xl font-semibold text-white drop-shadow-md',
            font.className
          )}>
          🔐 Auth
        </h1>
        <p className='text-white text-lg'>A simple authentication service</p>
        <div>
          <LoginButton asChild>
            <Button variant='secondary' size='lg'>
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  )
}
```

### create a loginButton

- we will ignore this part for nowe: mode === 'modal'

```ts
'use client'

import { useRouter } from 'next/navigation'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
// import { LoginForm } from "@/components/auth/login-form";

interface LoginButtonProps {
  children: React.ReactNode
  mode?: 'modal' | 'redirect'
  asChild?: boolean
}

export const LoginButton = ({
  children,
  mode = 'redirect',
  asChild,
}: LoginButtonProps) => {
  const router = useRouter()

  const onClick = () => {
    router.push('/auth/login')
  }

  if (mode === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className='p-0 w-auto bg-transparent border-none'>
          {/* <LoginForm /> */}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <span onClick={onClick} className='cursor-pointer'>
      {children}
    </span>
  )
}
```

## CARD WRAPPER

```ts
'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel: string
  backButtonLabel: string
  backButtonHref: string
  showSocial?: boolean
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) => {
  return (
    <Card className='w-[400px] shadow-md'>
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  )
}
```

### Create AuthHeader, Social, and BackButton componets, all in componets/auth

- Header

```ts
import { Poppins } from 'next/font/google'

import { cn } from '@/lib/utils'

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
})

interface HeaderProps {
  label: string
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className='w-full flex flex-col gap-y-4 items-center justify-center'>
      <h1 className={cn('text-3xl font-semibold', font.className)}>🔐 Auth</h1>
      <p className='text-muted-foreground text-sm'>{label}</p>
    </div>
  )
}
```

- BackButton

```ts
'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface BackButtonProps {
  href: string
  label: string
}

export const BackButton = ({ href, label }: BackButtonProps) => {
  return (
    <Button variant='link' className='font-normal w-full' size='sm' asChild>
      <Link href={href}>{label}</Link>
    </Button>
  )
}
```

- Social
- `npm react-icons`

```ts
'use client'

import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export const Social = () => {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const onClick = (provider: 'google' | 'github') => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  }

  return (
    <div className='flex items-center w-full gap-x-2'>
      <Button
        size='lg'
        className='w-full'
        variant='outline'
        onClick={() => onClick('google')}>
        <FcGoogle className='h-5 w-5' />
      </Button>
      <Button
        size='lg'
        className='w-full'
        variant='outline'
        onClick={() => onClick('github')}>
        <FaGithub className='h-5 w-5' />
      </Button>
    </div>
  )
}
```

### Add a layout to auth folder

```tsx
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800'>
      {children}
    </div>
  )
}

export default AuthLayout
```

### ADD LOGIN PAGE

- `auth/login/page.tsx`

  ```ts
  export default function page() {
    return <LoginForm />
  }
  ```

### Login Form

```ts
'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
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

export const LoginForm = () => {
  const searchParams = useSearchParams()
  // const callbackUrl = searchParams.get('callbackUrl')

  // const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('')
    setSuccess('')
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
            {/* {showTwoFactor && ( */}
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

            <>
              <FormField
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
          {/* <FormError message={error} />
          <FormSuccess message={success} /> */}
          <Button disabled={isPending} type='submit' className='w-full'>
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
```

### Add form Error and Success components

```ts
import { FaExclamationTriangle } from 'react-icons/fa'

interface FormErrorProps {
  message?: string
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null

  return (
    <div className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive'>
      <FaExclamationTriangle className='h-4 w-4' />
      <p>{message}</p>
    </div>
  )
}
```

```ts
// import { CheckCircledIcon } from "@radix-ui/react-icons";

import { CheckCircle } from 'lucide-react'

interface FormSuccessProps {
  message?: string
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null

  return (
    <div className='bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500'>
      <CheckCircle className='h-4 w-4' />
      <p>{message}</p>
    </div>
  )
}
```

### Login Action

```ts
'use server'

export async function loginAction(values: any) {
  console.log(values)
}
```

### Back to Login Form

```ts
'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
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
  // const callbackUrl = searchParams.get('callbackUrl')

  // const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError('')
    setSuccess('')
    startTransition(async () => {
      await loginAction(values)
      setError('')
      setSuccess('')
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
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type='submit' className='w-full'>
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
```

## REGISTER PAGE FORM< AND ACTION

### Copy the loging page and rename it Register, fix it as needed

```ts
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function page() {
  return <RegisterForm />
}
```

### Copy the login form; rename it , fix it as needed

```ts
'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { RegisterSchema } from '@/schemas'
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

export const RegisterForm = () => {
  const searchParams = useSearchParams()
  // const callbackUrl = searchParams.get('callbackUrl')

  // const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setError('')
    setSuccess('')
    startTransition(async () => {
      const res = await loginAction(values)
      setError(res.error)
      setSuccess(res.success)
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
            <>
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
                        type='name'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type='submit' className='w-full'>
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
```

### REGISTER ACTION AND SCHEMA

```ts
export const RegisterSchema = z.object({
  email: z.email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  name: z.string().min(1, {
    message: 'Name is required',
  }),
})
```

```ts
'use server'

import { RegisterSchema } from '@/schemas'
import z from 'zod'

export async function registerAction(values: z.infer<typeof RegisterSchema>) {
  const validatedValues = RegisterSchema.safeParse(values)
  if (validatedValues) {
    return { error: 'Invalid Objects' }
  }
  return {
    success: 'User createdf successfully',
  }
}
```

## DATABASE AND SCHEMA

### Install prisma

- `npm i -D prisma@5.7.1` and `npm i @prisma/client@5.7.1` and `npm i @auth/prisma-adapter@1.0.12`

### Create a db.ts file in lib folder

```ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
```

- ADD .ENV

- create a .env file in the root, dont forget to marke it in gitignore

### init PRISMA

- `npx prisma init`
- replace the DATABASE_URL crfeated in .env with our own from neon db
- create a quick user model in prisma>schema.prisma

```ts
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id   String @id @default(cuid())
  name String
}

```

- run `npx prisma generate` , now we can access the user model in our docs or files
- run `npx prisma db push` , now we can seee items in db, we syncked to db

### Create proper user models with the help of NEXTAUTH

- `https://authjs.dev/getting-started/adapters/prisma`
- copy and paste a USer model, adjust a s needed

```ts
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  accounts      Account[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

```

- we forgot to add a passsword to the user, so do, generate and push
- password should optional, as we areregisterrinf wiout password too

```ts
  model User {
    id            String    @id @default(cuid())
    password       String?
    name          String?
    email         String?   @unique
    emailVerified DateTime? @map("email_verified")
    image         String?
    accounts      Account[]

    @@map("users")
  }
```

## REGISTER FUNCIONALITY

- go to register action

```ts
'use server'

import { db } from '@/lib/db'
import { RegisterSchema } from '@/schemas'
import z from 'zod'

export async function registerAction(values: z.infer<typeof RegisterSchema>) {
  const validatedValues = RegisterSchema.safeParse(values)
  // console.log(values)

  if (!validatedValues) {
    return { error: 'Invalid Values' }
  }
  const createUser = await db.user.create({
    data: values,
  })
  if (!createUser) {
    return { error: 'Unable to creat user' }
  }
  return {
    success: 'User created successfully',
  }
}
```

- keep in mid that by savin=g the user that way we leave the passwrod exposed in case of a breach.

- We also have to check if the user exists!!

- `npm i bcryptjs@2.4.3`
- `npm i --save-dev @types/bcryptjs@2.4.6`
- test the action now

### Create getUserByEmail and getUserById function helpers

```ts
import { db } from '@/lib/db'

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email: email },
    })
    return user
  } catch (error) {
    return null
  }
}
```

```ts
import { db } from '@/lib/db'

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id: id },
    })
    return user
  } catch (error) {
    return null
  }
}
```

## MIDDLEWARE AND LOGIN

### install nextauth first

- `npm i next-auth@5.0.0-beta.4`
- create an auth.ts in the root
- notice we destructure GET and POST prior to exporting, so when we create atuh api aroiute we can jat grab them without destructurin there like Brad did in his eccomerce project

```ts
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [GitHub],
})
```

### Create the Next Auth api route

- create a file in app/api/auth/[...nextautp]/route.ts
- so basically what it does is to expose the authstufff via api. I goot dig more into this to know what the heck they really do under the hood, and why this.

```ts
export { GET, POST } from '@/auth'
```

- Notice that if you try to access the route, that is /api/auth/providers you will get an error. And thus, because nextauth requires to add a secret in .env. So go ahead and do that!!

```ts
AUTH_SECRET = 'mystring'
```

### MIDLEWARE

- create afile in the root called middleware, it has to be called that way as next.js requires it that way.
- so what config means is, anything that is in the matcher is where the middleware funtion will be ran. so if matcher:[/auth/login] then the middleware will run on just `/auth/login`
- the following expression means everything but some public files and APIs

```ts
import { auth } from './auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  console.log('ROUTE', req.nextUrl.pathname)
  console.log('is logged in ?: ', isLoggedIn)
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- But the way we are going to deal with our logic is as follows. we will make all routes private. obviously the ones in the matcheer as the the moddlewarew will run only there. anyways, we will the start adding our logic to determine who can access some pages. so its like the other way around, or how things are usually done.

### lets push a new branch to github

## Auht.ts splitting into auth.ts and auth.config.ts

- lets do it now so that we are up to date before with deal with the next section, which is about splitting our auth files into two due to compatibility issues with prisma adapters or maybe the middleware, im not 100% sure, gotta dig into that. so the middleawre talks to auth.ts, but now it will deal with auth.config, so the middleware seems to be the problematic one.

### Initial auth.config.ts

```ts
import GitHub from 'next-auth/providers/github'

import type { NextAuthConfig } from 'next-auth'

export default {
  providers: [GitHub],
} satisfies NextAuthConfig
```

### Manipulate auth.ts

- From

```ts
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [GitHub],
})
```

- To

```ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import authConfig from '@/auth.config'
import { db } from './lib/db'

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
```

### Manipulate middleware

- from

```ts
import { auth } from './auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  console.log('ROUTE', req.nextUrl.pathname)
  console.log('is logged in ?: ', isLoggedIn)
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- To:

```ts
import NextAuth from 'next-auth'
import authConfig from '@/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  console.log('ROUTE', req.nextUrl.pathname)
  console.log('is logged in ?: ', isLoggedIn)
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Creat a Test Page

- this should show null, which means everything as expected is working , we are just not logged in.

```ts
import { auth } from '@/auth'

export default async function page() {
  const session = await auth()
  return <div>{JSON.stringify(session)}</div>
}
```

### create a ts file called routes, in the root

- we will use them like constants in our middleware file

```ts
/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ['/', '/auth/new-verification']

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/error',
  '/auth/reset',
  '/auth/new-password',
]

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth'

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/settings'
```

### Back to middleware

```ts
import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from './routes'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // console.log('ROUTE', req.nextUrl.pathname)
  // console.log('is logged in ?: ', isLoggedIn)
  const { nextUrl } = req

  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  // Aloow every single api route
  if (isApiAuthRoute) {
    return null
  }

  // allow ever single aouth route, but if logged in then redirect
  if (isAuthRoute) {
    if (isLoggedIn) {
      // So we have to pass nextUrl with next js, so that it adds the domain prior to
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return null
  }

  // if not logged in and not in piblic route then log in!!
  //  ["/"] = we say allow just "/"; not "/"/somehtingElse
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/auth/login', nextUrl))
  }

  //allow everything else
  return null
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Test middleware

- you should be able to go to all we have in our folders but `/settings`
