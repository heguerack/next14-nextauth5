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

### Back to auth.config - Credentials

- auth.config from

```ts
import GitHub from 'next-auth/providers/github'

import type { NextAuthConfig } from 'next-auth'

export default {
  providers: [GitHub],
} satisfies NextAuthConfig
```

- To:

```ts
// import GitHub from 'next-auth/providers/github'

import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { LoginSchema } from './schemas'
import { getUserByEmail } from './helpers/user/getUserByEmail'
import bcrypt from 'bcryptjs'

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFileds = LoginSchema.safeParse(credentials)
        if (validatedFileds.success) {
          const { email, password } = validatedFileds.data
          // check if user exists
          const user = await getUserByEmail(email)
          // this because if not user or if user but user does not have a [pasword. becuase they probably signed up with  say google or a diferent way
          if (!user || !user.password) return null
          // user.password because thast the hasshedPassword cming back
          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (passwordsMatch) return user
        }
        return null
      },
    }),
  ],
} satisfies NextAuthConfig
```

### Bring signIn and signOut

- they can be used in both server components or actions

```ts
import NextAuth from 'next-auth'
import authConfig from '@/auth.config'

import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './lib/db'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
```

### Back to Login action

```ts
'use server'

import { signIn } from '@/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { LoginSchema } from '@/schemas'
import { AuthError } from 'next-auth'
import z from 'zod'

export async function loginAction(values: z.infer<typeof LoginSchema>) {
  const validatedValues = LoginSchema.safeParse(values)
  if (!validatedValues.success) {
    return { error: 'Invalid Objects' }
  }
  const { email, password } = validatedValues.data
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid Credentails!' }
        default:
          return { error: 'Somethign went worng' }
      }
    }
    // we just have to thwo this error, nextjsn requires it, not sure why
    throw error
  }
}
```

### Recapitulate after addinf credentials login

- So baiscally all we have done so far is to connect next auth credentials.
- we added the provider in auth.config, the auth will check if the password and email are the ones. if yes, then nexauth will sign in with the user and email provided in this case in login action. so basically in login action, instead of us doing the authentication nad redirectiong after, we let nextauth take over. notice that we still have to add the logic to nextauth via Credentials provider in auth config
- by the way it seems like providers can be in either auth or auth.config
- the adapter however has to be in auth

### Login Test

- try to login. once logged in, we will have a session (or loggedIn session)
- But notice that our session is just the email and password. we need to add id, role, and a bunch of more things in there. and thankfully nextauth letus do that easily with the help of callbacks. more specifically the session callback

### Add a signOut button

- go to settigs and add it there

```ts
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
```

- Notice we had to add server to the action, only on the server we can use signIn and signout
- We will learn how to log in and sign out from client componets after

## CALLBACKS

- Read the docs for more info `https://next-auth.js.org/configuration/callbacks`

```ts
callbacks: {
 async signIn({ user, account, profile, email, credentials }) {
      return true
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    },
    async session({ session, user, token }) {
      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      return token
    }
}
```

- So lets extend our session, but before we can extend the session we have to exten the jwt, as the session uses the token to actually generate the session

```ts
import NextAuth from 'next-auth'
import authConfig from '@/auth.config'

import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './lib/db'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  callbacks: {
    // hover over session to see options
    async session({ token, session }) {
      // we must return session
      console.log('session from callback session :', session)
      console.log('session token:', token)
      return session
    },
    // hover over jwt for options
    async jwt({ token }) {
      console.log('token from callback token :', token)
      // we must return token
      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
```

- console.log(token) =

```ts
console.log(token) = {
  name: 'frank',
  email: 'heguer76@gmail.com',
  picture: null,
  sub: 'cmdyjlh6y0001jhe5l8v2s7lf', // this is the id from the db!! or in other words the user.id
  iat: 1754480561,
  exp: 1757072561,
  jti: 'fb15c36e-17bc-436b-865d-6edb33520880',
}
```

```ts
console.log(session) = {
  user: { name: 'frank', email: 'heguer76@gmail.com', image: null },
  expires: '2025-09-05T12:07:11.580Z',
}
```

- As yuo can see, the session by default will include just the name, email, and image in the user object plus the expiry data.not sensitive data.
- and right now if we console.log the token in the jwt and the token in session they shoud be the same. but then we can add info to the token in jwt, that will be added or accesible in the session token, and thus is how we inject info to our nextauth session. so basically we will add and user.id to out jwrt session to be accesibale via session, in this ase it will be session.user.id, so yeah we added to the user in the session!! :)

### Add a field to the jwt token to be extracted at sesion token

```ts
 async jwt({ token, session }) {
      console.log('token from callback token :', token)
      // we must return token
      session.user.customField = 'test'
      return token
    },
```

- so now if we console.log(token) in session, we will see that the info was added to the token

```ts
session token: {
  name: 'frank',
  email: 'heguer76@gmail.com',
  picture: null,
  sub: 'cmdyjlh6y0001jhe5l8v2s7lf',
  iat: 1754485206,
  exp: 1757077206,
  jti: 'd188b476-6878-4330-a22c-7f895ef4e086',
  customeField: 'test'
}
```

- and now what we can do is for exaple attach the test value to the token in session
- So now if we look at out session token, it wil, ahve the customField attahced.
- so basically to transfer the id to the session token, we just ghave to reapet the process
- now to add the actual id, we dont need to set anything in the jwt callback as we access to the sub in session as well and thus what we need.

```ts
  async session({ token, session }) {
      // we must return session
      console.log('session from callback session :', session)
      console.log('session token:', token)
      // if (session.user) {
      //   session.user. = token.customField
      // }
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
```

- Now we have aces to the user.id anywhere we get access tot he session!!

### Adding more fields to ur session callback

- lets modify our prisma.schema to add a role

```ts

enum UserRole {
  ADMIN
  USER
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?
  emailVerified DateTime? @map("email_verified")
  image         String?
  role          UserRole  @default(USER)
  accounts      Account[]

  @@map("users")
}
```

- Shutdon the app and run `npx prisma generate` and `npx prisma db push`
- repeat the process on adding to session, lets add the role.
- note that this time we have to add it manually to the jtw callback token so that we can access it in session callback token. not as lucky as with the sub this time
- now lets add the role, to do that we need to use our action to grab the user from there, as we cant really access user info in the token, not sure why, still trying to figure out things in detail

```ts
import NextAuth from 'next-auth'
import authConfig from '@/auth.config'

import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './lib/db'
import { getUserById } from './helpers/user/getUserById'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  callbacks: {
    // hover over session to see options
    async session({ token, session }) {
      // we must return session
      // console.log('session from callback session :', session)
      // console.log('session token:', token)
      // if (session.user) {
      //   session.user. = token.customField
      // }
      if (token.sub && session.user) {
        session.user.id = token.sub
        console.log('session token :', token)
      }
      return session
    },
    // hover over jwt for options
    async jwt({ token }) {
      console.log('jwt token :', token)

      // we must return token
      // token.customField = 'test'
      // so to add the id to the session , we can just grab the sub from token in session
      // now lets add the role, to do that we need to use our action to grab the user from there, as we cant really access user info in the token, not sure why, still trying to figure out things in detail
      const user = await getUserById(token.sub as string)
      token.userRole = user?.role
      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
```

### Modify typescript for the role, maybe zod schema too

- guide fore dealing with this type bug kind opf thing `https://authjs.dev/getting-started/typescript`
- after trying as shown in the doca, we coudnt figure it out, so we will try a difrent way
- like I added the schema, but that and the prisma mdel is not enough.

- to get rid of th type error for the user role, or any other thing you want to add, the following seems to be the work around, or work flow. add it on top, in auth.ts

```ts
// Brad placed this in a next-auth.d.ts file
// flow used t inject values to types in nextauth
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: 'ADMIN' | 'USER'
    }
  }
}
```

- And this in the session callback

```ts
session.user.role = token.userRole as UserRole
```

### Email Verified

- Ok, so far so good. From loginAction we grant access to nextauth via Credentials provider. we can play with the logic via callbacks
- We have added id and role to the session. we also learnt how to deal with the type error for the role and similar.
- Lets now learn how to use signIn callback by NOT allowing access in case the email has not been verified

```ts
  async signIn({ user }) {
      const existingUser = await getUserById(user.id)

      if (!existingUser || !existingUser.emailVerified) {
        return false
      }
      return true
    },
```

- we will remove the signIn call back for now, but at least we now how to deal with the sign in call back as well

## OAuth (Google and Github)

- So if we go to `//auth/providers` the only thing we should say is just the Credentials one

```ts
{
"credentials": {
"id": "credentials",
"name": "Credentials",
"type": "credentials",
"signinUrl": "http://localhost:3000/api/auth/signin/credentials",
"callbackUrl": "http://localhost:3000/api/auth/callback/credentials"
}
}
```

- but if we add Google and GitHub

```ts
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { LoginSchema } from './schemas'
import { getUserByEmail } from './helpers/user/getUserByEmail'
import bcrypt from 'bcryptjs'

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFileds = LoginSchema.safeParse(credentials)
        if (validatedFileds.success) {
          const { email, password } = validatedFileds.data
          // check if user exists
          const user = await getUserByEmail(email)
          // this because if not user or if user but user does not have a [pasword. becuase they probably signed up with say google or a diferent way
          if (!user || !user.password) return null
          // user.password because thast the hasshedPassword cming back
          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (passwordsMatch) return user
        }
        return null
      },
    }),
    GitHub,
    Google,
  ],
} satisfies NextAuthConfig
```

- we get this:

```ts
  {
  "credentials": {
  "id": "credentials",
  "name": "Credentials",
  "type": "credentials",
  "signinUrl": "http://localhost:3000/api/auth/signin/credentials",
  "callbackUrl": "http://localhost:3000/api/auth/callback/credentials"
  },
  "github": {
  "id": "github",
  "name": "GitHub",
  "type": "oauth",
  "signinUrl": "http://localhost:3000/api/auth/signin/github",
  "callbackUrl": "http://localhost:3000/api/auth/callback/github"
  },
  "google": {
  "id": "google",
  "name": "Google",
  "type": "oidc",
  "signinUrl": "http://localhost:3000/api/auth/signin/google",
  "callbackUrl": "http://localhost:3000/api/auth/callback/google"
  }
  }
```

### Add keys to the GitHub and Google objects

- bring them from .env, which means we have to add those values from google and github

```ts
 GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
```

- Go to GitHub>settings>Developer Settings(all the way to the bottom)>OAuth >
- register a new OAuth app, Homepage URL:http://localhost:3000 ,adn the callbackUrl can be grabbed from the `http://localhost:3000/api/auth/providers` route, which is `http://localhost:3000/api/auth/callback/github`

- Lets do the same thing, but for google
- `https://console.cloud.google.com/`>create a new project(in projects)>give it a name>create>selec project>apis and services>OAuth consentr screen> app information+ user suport email>create>credentials>ctea credentails>OAuth client id>aplication type (web application)>leave name as it is>URIs= http://localhost:3000 > Authorized redirect URIs
  ="http://localhost:3000/api/auth/callback/google
-

### Implement social login

- Now that we added google and github for sign in, go to Social.tsx and the the funtionality
- we could do soemthing asdn say await signIn("google") in loginAction, but that ould be just server
- instead e are going to do it right from the cleint as follwos, go to Social
- Notice that the signIn comes from `next-auth/react` and from `@/auth`
- also we dont have `redirectTo` we have `callbackUrl`

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
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
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

- Test; Notice that e dont need to sign up , just login and user is created. So e dont need to go through th jt, and compare passords, nothing.
- Notice we get an image now, and also mwe have an acoount, with more info such us provider, access token, etc.
- Also notice that we need email verification, but it makes no sense to have that for the socials as they a;lreasy get email verification, unless we want to verify trhough our end too. why email verification is important? well we dont want to grant access to fake emails.
- We can do that throught events as shwon in the next topic

### Events

- Evnet are asynchronous funtions that do not return a response, they are usefull for audit logs, resporting or handling any other side effects
- `https://next-auth.js.org/v3/configuration/events`
- go to auth.ts

```ts
} = NextAuth({
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
  callbacks: {
```

- so basically what this one does is in singIn if with a socialProvider then it updates the db for us.
  -,Another thign to keep in mind is that we didnt use the new authorized callback inthe auth.config (the replcaement for the old way or the way we are ding here) I like this approach better, i feel we have more control.
- and finally these are very powerful funtion =s these vents ones, as they dont need to return anything.
- Note: in the course, anotnio got an error when trying to log in with the same google acount once logged out. it get redirected to a nextauth signin page, i dont have that issue.
- the way he fuxes that is: abouve events, add pages.

```ts
} = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
```

### AuthError Page

-Because we added oir own redirect if sothing goes wron when signin in or out. lest add the auth error page

```ts
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
```

### Adding errorr mesage to social login

```ts

export const LoginForm = () => {
  const searchParams = useSearchParams()
  const urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? 'Another account already exists with the same e-mail address, maybe a cosial account withe same email':""


  <FormError message={error || urlError} />

```

## VERIFICATION TOKEN

- now lets add verification token to our system. we start by cearting a verificatioToken model in schema.prisma

```ts
  model VerificationToken {
    id      String   @id @default(cuid())
    email   String
    token   String   @unique
    expires DateTime

    // and no need to create a relationwith the user, it can live on its own
    //only one token for speceific email
    @@unique([email, token])
  }
```

- again generate and push

### create verification token helper fnctions

- Maybe in helpers/data/verificationToken.ts

```ts
import { db } from '@/lib/db'

export async function getVerificationTokenByEmail(email: string) {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    })
  } catch (error) {
    null
  }
}

export async function getVerificationTokenByToken(token: string) {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { token },
    })
  } catch (error) {
    null
  }
}
```

### Create a GenerateVerificationToken

- `npm i npm i uuid@9.0.1` and `npm i --save-dev @types/uuid@9.0.7`
- cerate a generateVerificationToken.ts file
- this will be our helper or srver funtion? ... hm , i dont think this is secure lol, it should be in action.

```ts
import { v4 as uuidv4 } from 'uuid'
import { getVerificationTokenByEmail } from './verificationToken'
import { db } from '@/lib/db'

export async function generateVerificationToken(email: string) {
  const token = uuidv4()
  // expires in one hour
  const expires = new Date(new Date().getTime() + 3600 * 100)
  // check if existingToken
  const tokenExists = await getVerificationTokenByEmail(email)
  if (tokenExists) {
    const removeToken = await db.verificationToken.delete({
      // we could also say:where:{email}
      // bI think the logic is the same, maybe we must remove with an id, niot just anyother property. even if that other property is unique, like email is in this project.
      where: { id: tokenExists.id },
    })
  }
  const verificationToken = await db.verificationToken.create({
    data: { email, token, expires },
  })
  return verificationToken
}
```

### Using generationVerificationToken()

- go to registerAction
- Run the verificationToken funtion just before the return, or right after the user has been created.

```ts
const verificationToken = await generateVerificationToken(email)

return {
  success: 'User created successfully',
}
```

- ok so token verificationtoken has been craeted, and then what?
- ok, so it seesm that we have to somehow get the user to enter that verificationtoken when they try to log in, im guessing for the fist time.
- so that means, we have to go back to the signIn callback adn add the logic back so that if the user is not verified then they cant access.
- also it would be nice to redirec to login after registering
- and then also a way to let users know they need to be veified
- ok, now lets apply the same login in login action
- but it seems confusing becuase the token is active for 1 hour, which means if they dont sign in within one hour of registration they can taccess, and thats all? i htough the idea was that they click on a li kk on thier email to verify it, maybe its coming later
- ok, so the token gets created wehn trying to log in, but acees is not granted yet becase it hasnt been verified!
- so we must send the token to their email and then get that token back
- we have to do the same kind of thing in the auth.ts just to make sure
  -Add a signIn callback for the verificationToken logic

```ts
 async signIn({ user, account }) {
      // aloow OAuth witjhout email verification
      //Althought I odnt think we need it, becasue if social an email will be verifoed one the spot
      if (account?.provider !== 'credentials') return true
      const existingUser = await getUserById(user.id)
      //prevent signin without email verification
      if (!existingUser || !existingUser.emailVerified) {
        return false
      }

      return true
    },
```

### send email to verify to veriryEmail with resend

- `https://resend.com/`
- create a resend API key
- go to docs > next js quick start>
- `npm i resend@2.1.0`
- remeber that for production you need to verify your email to be able to send emails,. for now the onboring option is fine

- creat a mail.ts file

```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Confirm your email',
    html: ` <p className=''>
        <a href='${confirmLink}'>here</a> to confirm email.
      </p>`,
  })
}
```

- Now lest go back to register to actually send the verification email

```ts
const verificationToken = await generateVerificationToken(email)

await sendVerificationEmail(verificationToken.email, verificationToken.token)
```

- now do the same for the login

## EMAIL VERIFICATION

- `npm i react-spinners`
- create an action to verify the token

### Email verification Action

```ts
'use server'

import { getVerificationTokenByToken } from '@/helpers/data/getVerificationToken'

import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { db } from '@/lib/db'

export async function newVerificationTokenAction(token: string) {
  const existingToken = await getVerificationTokenByToken(token)
  if (!existingToken) {
    return { error: 'Token does not exist' }
  }

  const hasExpired = new Date(existingToken.expires) < new Date()
  if (hasExpired) {
    return { error: 'Token has expired!' }
  }

  const existingUser = await getUserByEmail(existingToken.email)
  if (!existingUser) {
    return { error: 'Email does not exist' }
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      // this line if the user wats to change thir email, not sure about the logic , later maybe
      email: existingToken.email,
    },
  })

  //remove token after
  await db.verificationToken.delete({
    where: { id: existingToken.id },
  })

  return { success: 'Email verified!' }
}
```

- Notice that we are using those verification helper funtions, that communicate with db, they should be actions too. I feel is not safe. really need to dig into that

### Vew-verification Page

- Antonio did it in a component, i ealized i had it on a page after, so left it like that

```ts
'use client'

import { newVerificationTokenAction } from '@/actions/newVerificationTokenAction'
import { CardWrapper } from '@/components/auth/CardWrapper'
import { FormError } from '@/components/form-error'
import { FormSuccess } from '@/components/form-success'
import { getVerificationTokenByToken } from '@/helpers/data/getVerificationToken'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { db } from '@/lib/db'
import Link from 'next/link'
import { redirect, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'

// type pagePros = {
//   searchParams: { token?: string }
// }
// export default async function newVerificationPage({ searchParams }: pagePros) {
// const paramToken = await searchParams.get("")

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

  // because we are not exporting the on submid funtion, then i like it his way better:
  // useEffect(() => {
  //   if (!token) {
  //     setError('Missing token')
  //     return
  //   }
  //   newVerificationTokenAction(token)
  // .then((data) => {
  //   setSuccess(data.success)
  //   setError(data.error)
  // })
  // .catch((error) => {
  //   setError('Somethig went wrong')
  // })
  // }, [token])
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
```

- The logic works great but we get a local error Tokjen does not exist, and that because lcaolly react runs twice, so it reruns the logic and by then the token has been delted.
- So you can deal with this error now, ormyou cn visually check that the user has been verified, procedd manually to login and boom
- i tried correcting the problem like this but itdidn work, it is till runs twice

```ts
const [myToken, setMyToken] = useState(false) //new

const onSubmit = useCallback(() => {
  if (!token) {
    setError('Missing token')
    return
  }

  if (myToken) return // new

  newVerificationTokenAction(token)
    .then((data) => {
      setSuccess(data.success)
      setError(data.error)
      setMyToken(true) //new
    })
    .catch((error) => {
      setError('Somethig went wrong')
    })
}, [token])

useEffect(() => {
  onSubmit()
}, [onSubmit])
```

- So i tried to have a state on the fistr run so that on the second run if would be denied if my state is tue, whci is with the first run

## PASSWORD RESET TOKEN

- go to loging form
- make sure you have this logic in place

```ts
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
          <Link href='/auth/reset'>Forgot password?</Link> // new
        </Button>
        <FormMessage />
      </FormItem>
```

- make sure to also creat the `/auth/reset/page.tsx`

```ts
export default function resetPage() {
  return <ResetForm />
}
```

- make sure to creat the ReseTForm as well

### Reset Form

- copy and pasten the loginform
- fix as required, like remove the cosial prop, remove seacrParams
- Here is a clean copy; it seems we will do something similarmto that we did for the email verification. like if the person forget the password, we can reset the password by verifying the email, and granting permisson to change the passsword on a redirect page, from the front end just like we did with the email verification

```ts
'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
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

export const ResetForm = () => {
  // const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [success, setSuccess] = useState<string | undefined>('')
  const [error, setError] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
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
      headerLabel='Forgot your password?'
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

- Create a reset schema

```ts
export const ResetSchema = z.object({
  email: z.email({
    message: 'Email is required',
  }),
})
```

- Add a PasswordResetToken model in schema.prisma

```ts
model PasswordResetToken {
  id            String   @id @default(cuid())
  email         String
  passwordToken String   @unique
  expires       DateTime

  @@unique([email, passwordToken])
```

### password reset helper funtions

- in helpers/data generatePasswordResetToken.ts and getPasswordResetToken.ts

```ts
import { db } from '@/lib/db'

export async function getPasswordResetTokenByToken(token: string) {
  try {
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: { passwordToken: token },
    })
    return passwordResetToken
  } catch (error) {
    null
  }
}

export async function getPasswordResetTokenByEmail(email: string) {
  try {
    const passwordResetToken = await db.passwordResetToken.findFirst({
      where: { email },
    })
    return passwordResetToken
  } catch (error) {
    null
  }
}
```

and

```ts
import { v4 as uuidv4 } from 'uuid'
import { getVerificationTokenByEmail } from './getVerificationToken'
import { db } from '@/lib/db'
import { getPasswordResetTokenByEmail } from './getPasswordResetToken'
export async function generatePasswordResetToken(email: string) {
  const token = uuidv4()
  // expires in one hour
  const expires = new Date(new Date().getTime() + 3600 * 100)
  // check if existingToken
  const tokenExists = await getPasswordResetTokenByEmail(email)

  if (tokenExists) {
    const removeToken = await db.passwordResetToken.delete({
      where: { id: tokenExists.id },
    })
  }

  const passwordResetToken = await db.verificationToken.create({
    data: { email, token, expires },
  })
  return passwordResetToken
}
```

### create ResetPassword Email funtion

```ts
export const sendResetEmail = async (email: string, token: string) => {
  console.log('email from sendResetEmail ', email)

  const resetLink = `http://localhost:3000/auth/new-password?token=${token}`

  const emailSent = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your password',
    html: ` <p className=''>
        <a href='${resetLink}'>here</a> to reset password.
      </p>`,
  })
}
```

### Back to reset action

```ts
'use server'

import { auth } from '@/auth'
import { sendResetEmail } from '@/helpers/mail/mail'
import { ResetSchema } from '@/schemas'
import z from 'zod'
import crypto from 'crypto'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { generatePasswordResetToken } from '@/helpers/data/generatePasswordResetToken'

export async function resetAction(values: z.infer<typeof ResetSchema>) {
  const validatedValues = ResetSchema.safeParse(values)
  // console.log(validatedValues)

  if (!validatedValues.success) {
    return { error: 'Invalid Email' }
  }
  const email = validatedValues.data.email

  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    return { error: 'Not email found to reset your password' }
  }
  const passwordResetToken = await generatePasswordResetToken(
    validatedValues.data.email
  )

  const sendEmail = await sendResetEmail(
    passwordResetToken.email,
    passwordResetToken.passwordToken
  )

  return { success: 'we have sent the email to change password' }
}
```

## NewPasswordForm and Action

### NewPasswordForm

```ts
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
```

### New Password Action

```ts
'use server'

import { db } from '@/lib/db'
import { NewPasswordSchema } from '@/schemas'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { getVerificationTokenByToken } from '@/helpers/data/getVerificationToken'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'

export async function newPasswordAction(
  values: z.infer<typeof NewPasswordSchema>,
  token?: string
) {
  if (!token) return { error: 'Missing token at newPasswordAction!' }

  const validatedValues = NewPasswordSchema.safeParse(values)
  if (!validatedValues.success) {
    return { error: 'Invalid Values' }
  }

  console.log(values.password, token)

  //check if token exists
  const existingToken = await getVerificationTokenByToken(token)
  if (!existingToken) return { error: 'we coudlt find the token in database' }

  // check if token has expired
  const hasExpired = new Date(existingToken.expires) < new Date()
  if (hasExpired) return { error: 'token has expired' }

  // now check if user exist before trying to update
  const existingUser = await getUserByEmail(existingToken.email)
  if (!existingUser) return { error: 'User with that email does not exist' }

  const passsword = validatedValues.data.password

  const hashedPassword = await bcrypt.hash(passsword, 10)

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  })

  // now lets delete the unused token
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  })

  return { success: 'Password updated' }
}
```

## TWO FACTOR AUTENTICATION

- Go to prisma.schema

```ts
model TwoFactorToken {//new
  id      String   @id @default(cuid())
  email   String
  token   String   @unique
  expires DateTime

  @@unique([email, token])
}

model TwoFactorConfirmation {//new
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId])
}

model User {
  id                 String    @id @default(cuid())
  name               String?
  email              String?   @unique
  password           String?
  emailVerified      DateTime? @map("email_verified")
  image              String?
  role               UserRole  @default(USER)
  accounts           Account[]
  isTwoFactorEnabled Boolean   @default(false)//new

  TwoFactorConfirmation TwoFactorConfirmation?//new
}
```

### lLts Reset db

- npx prisma generate
- npx prisma migrate reset
- npx prisma db push

### Create twoFactorToken funtion helpers

- GeneratTwoFactotoken.ts

```ts
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { getTwoFactorTokenByEmail } from './getTwoFactorToken'
import { getUserByEmail } from '../user/getUserByEmail'

export async function generateTwofactorToken(email: string) {
  // const token = uuidv4()
  // we wont use this one now, i guess its for ercurity purposes that we use crypto as it gives usa very stro code or passwrd

  const token = crypto.randomInt(100_000, 1_000_000) // the _ just lets us read easily
  //reduce to 15 minuts or so, after development
  const expires = new Date(new Date().getTime() + 3600 * 100) // this will gives us a 6 digit code not getting into a million

  // check if the twofactor token exists
  const existingToken = await getTwoFactorTokenByEmail(email)

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: { id: existingToken.id },
    })
  }

  //create token
  const twofactorToken = await db.twoFactorToken.create({
    data: { email, token: token.toString(), expires },
  })
}
```

- getTwoFactorToken.ts

```ts
import { db } from '@/lib/db'

export async function getTwoFactorTokenByToken(token: string) {
  try {
    const twofatcorToken = await db.twoFactorToken.findUnique({
      where: { token: token },
    })
    return twofatcorToken
  } catch (error) {
    null
  }
}

export async function getTwoFactorTokenByEmail(email: string) {
  try {
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: { email },
    })
    return twoFactorToken
  } catch (error) {
    null
  }
}
```

- getTwoFactorTokenConfirmation.ts

```ts
import { db } from '@/lib/db'

export async function getTwoFactorTokenByToken(token: string) {
  try {
    const twofatcorToken = await db.twoFactorToken.findUnique({
      where: { token: token },
    })
    return twofatcorToken
  } catch (error) {
    null
  }
}

export async function getTwoFactorTokenByEmail(email: string) {
  try {
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: { email },
    })
    return twoFactorToken
  } catch (error) {
    null
  }
}
```

### Create the sendTwoFactorTokenEmail Function

```ts
export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: '2FA Code',
    html: ` <p className=''>
        This is your setet 2FA ${token}
      </p>`,
  })
}
```

### Add TwoFacto Confirmation Logic to callbacks

```ts
 callbacks: {
    // hover over session to see options
    async signIn({ user, account }) {
      // aloow OAuth witjhout email verification
      //Althought I odnt think we need it, becasue if social an email will be verifoed one the spot
      if (account?.provider !== 'credentials') return true
      const existingUser = await getUserById(user.id)
      //prevent signin without email verification
      if (!existingUser || !existingUser.emailVerified) {
        return false
      }
      // prevent sign in if twofactorAuthenticaton is enabled
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        )
        if (!twoFactorConfirmation) return false
        //Delete twoFactor Confirmation for the next sign in
        //had to remove this cuz it was clashing with my own logic for the 2FA
        // await db.twoFactorToken.delete({
        //   where: { id: twoFactorConfirmation.id },
        // })
      }
      return true
    },
```

- That logic was to lock the user out right from nextauth via callbacks, lets now go to the login action to apply somemlogic there

### twoFactor logic

- in LoginForm

```ts
const [showTwoFactor, setShowTwoFactor] = useState(false)

const onSubmit = (values: z.infer<typeof LoginSchema>) => {
  setError('')
  setSuccess('')
  startTransition(() => {
    loginAction(values).then((res) => {
      if (res?.error) {
        setError(res.error)
      }
      if (res?.success) {
        setSuccess(res.success)
        if (res.success === 'Enter two factor code') {//new
          setShowTwoFactor(true)//new
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
          {showTwoFactor && (//new
            <FormField //new
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


```

- Back to login

```ts
'use server'

import { signIn } from '@/auth'
import { generateTwofactorToken } from '@/helpers/data/generateTwofactorToken'
import { generateVerificationToken } from '@/helpers/data/generateVerificationToken'
import { getTwoFactorTokenByEmail } from '@/helpers/data/getTwoFactorToken'
import {
  sendTwoFactorTokenEmail,
  sendVerificationEmail,
} from '@/helpers/mail/mail'
import { getUserByEmail } from '@/helpers/user/getUserByEmail'
import { db } from '@/lib/db'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { LoginSchema } from '@/schemas'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import z from 'zod'

export async function loginAction(values: z.infer<typeof LoginSchema>) {
  const validatedValues = LoginSchema.safeParse(values)
  if (!validatedValues.success) {
    return { error: 'Invalid Objects' }
  }
  const { email, password, code } = validatedValues.data

  const existingUser = await getUserByEmail(email)
  if (!existingUser) {
    return { error: 'Not user with that email' }
  }

  if (!existingUser?.emailVerified) {
    const verificationToken = await generateVerificationToken(email)
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )
    return { success: 'confirmation email sent' }
  }

  // check first if a twoFactorToken has been generated and is attched to that email
  const token = await getTwoFactorTokenByEmail(email) //new
  console.log('generatedToken :', token)
  console.log('code :', { code })

  if (token) {
    //new
    if (token.token !== code?.trim()) {
      return { error: 'Tokens dontmatch!' }
    }
    //check if token is active
    if (token.expires < new Date()) return { error: 'Code expired' }
    // create TwofactorConfirmation in db
    await db.TwoFactorConfirmation.create({
      data: {
        userId: existingUser.id,
      },
    })
    // console.log('twofactorConfirmation created')
    // deleting two factor token
    await db.twoFactorToken.deleteMany({
      where: { id: token.id },
    })
  }

  // if user is enabled but not two factor confirmation in place
  // so creat token and send email with token
  //check exitning USing again as it ws probably updated
  const checkExistingUser = await getUserByEmail(email)
  if (!checkExistingUser) return { error: 'Not user with that email' } //new
  if (
    checkExistingUser.isTwoFactorEnabled &&
    !checkExistingUser.TwoFactorConfirmation
  ) {
    console.log('existing user is two factor enabled')
    console.log('existing user is not two factor confirmed')
    console.log(
      'checkingExistingUser.TwoFactorConfirmation :',
      existingUser.TwoFactorConfirmation
    )

    const generateToken = await generateTwofactorToken(email)
    await sendTwoFactorTokenEmail(email, generateToken.token)
    console.log('sent email for two factor confirmation')
    return {
      success: 'Enter two factor code',
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      // redirectTo: DEFAULT_LOGIN_REDIRECT,
      redirect: false,
    })
    await db.TwoFactorConfirmation.deleteMany({
      //new
      where: { userId: existingUser.id },
    })
    redirect(DEFAULT_LOGIN_REDIRECT) //new
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid Credentails!' }
        default:
          return { error: error.type }
      }
    }
    // we just have to thwo this error, nextjsn requires it, not sure why
    throw error
  }
}
```

## USER BUTTONS AND HOOKS

- So right now we can logout from settings by calling or awaiting signout, but what if that was a client component? but what if we need client logic?
- create a SessionProvider and add it to a layout, depending on logic. we will do in (protected)

### Auth client

```ts
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { auth } from '@/auth'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default async function RootLayout({
  //new
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <html lang='en'>
        <body className={inter.className}>{children}</body>
      </html>
    </SessionProvider>
  )
}
```

```ts
'use client'

import { auth, signOut } from '@/auth'
import { useSession } from 'next-auth/react'

// export default async function page() {
export default function page() {
  // const session = await auth()
  const session = useSession()

  return (
    <div>
      {JSON.stringify(session)}
      <form
      // action={async () => {
      //   'use server'
      //   await signOut()
      // }}
      >
        <button>Sign out</button>
      </form>
    </div>
  )
}
```

- page

```ts
  'use client'

// import { auth, signOut } from '@/auth'
import { signOut, useSession } from 'next-auth/react'

// export default async function page() {
export default function page() {
// const session = await auth()
const session = useSession()

return (

<div>
{JSON.stringify(session)}
{/_ <form
action={async () => {
'use server'
await signOut()
}} > _/}
<button onClick={() => signOut()}>Sign out</button>
{/_ </form> _/}
</div>
)
}
```

- We could also creat a action to sign out, that would beb server but can be called from any cleint component. We would do this if we wanrt some server logic to be done prior to loggin out
- - now pay attention t the session from useSession. for us to get the user we have to go session.data.user, so it miught be become annoying.
- Lets creat a hook for that then!

```ts
import { useSession } from 'next-auth/react'

export async function useGetCurrentUser() {
  const session = useSession()
  const user = session?.data?.user
  if (!user) return { error: 'User not found' }
  return user
}
```

### Protected Routes Layout

```ts
import ProtectedNavbar from './ProtectedNavbar'

export default function protectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='h-full w-full flex flex-col gap-y-10 items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800'>
      <ProtectedNavbar />
      {children}
    </div>
  )
}
```

### ProtectedNavbar component

```ts
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ProtectedNavbar() {
  const pathname = usePathname()
  return (
    <nav className='bg-secondary flex justify-between items-center p-4 rounded-xl w-[600px] shadow-sm'>
      <div className='flex gap-x-2'>
        <Button
          asChild
          variant={pathname === '/client' ? 'default' : 'outline'}>
          <Link href={'/client'}>Client</Link>
        </Button>
        <Button
          asChild
          variant={pathname === '/server' ? 'default' : 'outline'}>
          <Link href={'/server'}>Server</Link>
        </Button>
        <Button asChild variant={pathname === '/admin' ? 'default' : 'outline'}>
          <Link href={'/admin'}>Admin</Link>
        </Button>
        <Button
          asChild
          variant={pathname === '/settings' ? 'default' : 'outline'}>
          <Link href={'/settings'}>Settings</Link>
        </Button>
        <Button asChild variant={pathname === '/admin' ? 'default' : 'outline'}>
          <Link href={'/admin'}>Admin</Link>
        </Button>
      </div>
      <p className=''>User Button</p>
    </nav>
  )
}
```

### Reusable Logout Buttton

- `components/auth/LogoutButton.tsx`

```ts
'use client'

import { useRouter } from 'next/navigation'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { signOut } from 'next-auth/react'
import { logoutAction } from '@/actions/logoutAction'
// import { LoginForm } from "@/components/auth/login-form";

interface LoginButtonProps {
  children: React.ReactNode
  mode?: 'modal' | 'redirect'
  asChild?: boolean
}

export const LogoutButton = ({
  children,
  mode = 'redirect',
  asChild,
}: LoginButtonProps) => {
  const router = useRouter()

  const onClick = async () => {
    await logoutAction()
  }

  return (
    <span onClick={onClick} className='cursor-pointer'>
      {children}
    </span>
  )
}
```

### UserButton.tsx

```ts
'use client'

import { FaUser } from 'react-icons/fa'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { LogoutButton } from './LogoutButton'
import { EqualApproximatelyIcon, LogOutIcon } from 'lucide-react'
import { FcLeave } from 'react-icons/fc'

export default function UserButton() {
  const user = useGetCurrentUser()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || ''} />
          <AvatarFallback className='bg-blue-500'>
            <FaUser className='text-white' />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40' align='end'>
        <LogoutButton>
          <DropdownMenuItem>
            <LogOutIcon /> Logout
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## SERVER AND CLIENT EXAMPLE

-create a userInfoComponet, which we will use in server or cleitn compnent, wo it wil, behave like both of them. we willsee

### UserInfo.tsx

```ts
import NextAuth, { type DefaultSession } from 'next-auth'
import { Card, CardContent, CardHeader } from '../ui/card'

// so basically this is a way to etnd our types, i guess we could have extended the  zodschemas too. many ways of doing things seem like.
interface UserInfoProps {
  user?: DefaultSession['user'] & {
    role: 'ADMIN' | 'USER'
    // isTwoFactorEnabled: boolean
  }

  label: string
}

export default function UserInfo({ user, label }: UserInfoProps) {
  return (
    <Card>
      <CardHeader>
        <p className='text-2xl font-semibold tect-center'>{label}</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>ID</p>
          <p className='truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md '>
            {user?.id}
          </p>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Name</p>
          <p className='truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md '>
            {user?.name}
          </p>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Email</p>
          <p className='truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md '>
            {user?.email}
          </p>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Role</p>
          <p className='truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md '>
            {user?.role}
          </p>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>TFA</p>
          <p className='truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md '>
            {/* {user?.isTwoFactorEnabled} */}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Server Page

```ts
import UserInfo from '@/components/auth/UserInfo'
import { currentUser } from '@/helpers/user/currentUser'

export default async function page() {
  const user = await currentUser()
  return <UserInfo user={user} label='' />
}
```

### Lets not forget to add the TFA (on/off) to the session and token

- in auth.ts

```ts
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: 'ADMIN' | 'USER'
      isTwoFactorEnabled: boolean
    }
  }

  async jwt({ token }) {...
  token.isTwoFactorEnabled = user.isTwoFactorEnabled

  async session({ token, session,  }) {...
   if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
      }
}
```

- Go back and modify the UserInfo.tsx

```ts
<Badge variant={user?.isTwoFactorEnabled ? 'success' : 'destructive'}>
  {user?.isTwoFactorEnabled ? 'ON' : 'OFF'}
</Badge>
```

### Client Page

- notice that we replced the way we fetch the user, and casically thast it!

```ts
'use client'

import UserInfo from '@/components/auth/UserInfo'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

export default function clientPage() {
  const user = useGetCurrentUser()

  return <UserInfo user={user} label='Client Componet' />
}
```

## ADMID PAGE EXAMPLE

- lets creat a quick hook for grabing the role

```ts
import { useSession } from 'next-auth/react'

export async function useCurrentRole() {
  const sesssion = useSession()
  return sesssion?.data?.user?.role
}
```

- buit lets also creat a helper in case its a server componet

```ts
import { auth } from '@/auth'

export async function currentUser() {
  const session = await auth()
  return session?.user?.role
}
```

- Back to admin page
- But tlets first creat a RoleGate.tsx

### RoleGate.tsx

```ts
'use client'

import { useCurrentRole } from '@/hooks/useCurrentRole'
import { UserRole } from '@prisma/client'
import { FormError } from '../form-error'

interface RoleGateProps {
  children: React.ReactNode
  allowedRole: UserRole
}

export default function RoleGate({ children, allowedRole }: RoleGateProps) {
  const role = useCurrentRole()
  if (role !== allowedRole) {
    return (
      <FormError message='You do not have permission to view this content!' />
    )
  }
  return <>{children}</>
}
```

### BAck To admin page

```ts
'use client'

import RoleGate from '@/components/auth/RoleGate'
import { FormSuccess } from '@/components/form-success'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import { UserRole } from '@prisma/client'

export default function page() {
  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-2xl font-semibold text-center '>🔑 Admin</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message='you are allowed to see this content!' />
        </RoleGate>
      </CardContent>
    </Card>
  )
}
```

### Server Action and API Examples

```ts
import { currentRole } from '@/helpers/user/currentRole'
import { UserRole } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET() {
  const role = await currentRole()
  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: 200 })
  }
  return new NextResponse(null, { status: 403 })
}
```

- consummed in admin page

```ts
const onApiClick = () => {
  fetch('/api/admin').then((res) => {
    if (res.ok) {
      console.log('response is ok')
    } else {
      console.error('FORBIDDEN')
    }
  })
}
```

## SETTINGS

### settingsAction

```ts
'use server'

import { currentUser } from '@/helpers/user/currentUser'
import { getUserById } from '@/helpers/user/getUserById'
import { db } from '@/lib/db'
import { SettingsSchema } from '@/schemas'
import z from 'zod'

export async function settingsAction(values: z.infer<typeof SettingsSchema>) {
  const user = await currentUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  // is this becasue we can have an user in a session but posibly in db?
  const dbUser = await getUserById(user.id)
  if (!dbUser) {
    return { error: 'Unauthorized' }
  }
  await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...values,
    },
  })
  return { success: 'Settings Updated!' }
}
```

### Setting page

- As a test we can start with psssing a hardocde value to cahnge, like name
- I ytested the following code, it workds fine.

```ts
'use client'

import { settingsAction } from '@/actions/settingsAction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { Settings } from 'lucide-react'
import { startTransition, useTransition } from 'react'

export default function settingsPage() {
  const [isPending, startTransition] = useTransition()
  const onclick = () => {
    startTransition(() => {
      settingsAction({
        name: 'Frankitoj',
      })
    })
  }
  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-2xl font-semibold text-center flex items-center justify-center gap-4'>
          <Settings />
          Settings
        </p>
      </CardHeader>
      <CardContent>
        <Button onClick={onclick} disabled={isPending}>
          {isPending ? 'updating...' : 'Update name'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Updating session after chenges in settings page

- but here is the deal, it does not udate what see see in the other routes, as they dond have the fresh data yet.
- So that means we have to change the session! yes, everytime we update fileds that are in the session!!
- We have teo options to update the session this way. for instance in a client component , we can bring useSession()
- So we are manually updating the session

```ts
export default function settingsPage() {
  const {update,data,status}= useSession()
  const [isPending, startTransition] = useTransition()
  const onclick = () => {
    startTransition(() => {
      settingsAction({
        name: 'Frankitoj',
      })
    }).then(()=>{
      update()
    })
  }

```

- So long soty short, even if we revalidate those paths, they are taking the name and data to display from the user that is in session, so even if we bring new data, it wont reflec in our session, whic is why we have to manually. remeber at the beggining we attched role, ans isTwofactorAuthenticated, cuz we weanted to play with htose, now the same thing for name, email, and any other fiel we want updated.

```ts
async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        // console.log('sessionSession :', session)
        // console.log('sessionToken :', token)
      }
      if (token.userRole && session.user) {
        session.user.role = token.userRole as UserRole
      }
      if (session.user) {
        // seems like i odnt need to reply in adding stuff to the token, i an just bring it here via actions!
        // const user = await getUserById(session.user.id)
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.name = token.name
        session.user.email = token.email
      }
      // console.log('sessionAuth :', session)
      // console.log('sessionAuthUser :', session.user)

      return session
    },
    // hover over jwt for options
    async jwt({ token }) {
      console.log('Im being called again')

      // console.log('jwt token :', token)
      // we must return token
      if (!token.sub) return token
      const user = await getUserById(token.sub as string)

      if (!user) return token
      token.email = user.email
      token.name = user.name
      token.userRole = user.role
      token.isTwoFactorEnabled = user.isTwoFactorEnabled
      return token
    },
```

### AccountsAction- to with accouts (Social)

- We cant change the same data for social accoutns

```ts
'use server'

import { db } from '@/lib/db'

export async function accountsActions(userId: string) {
  try {
    const account = await db.account.findFirst({
      where: { userId: userId },
    })
    return account
  } catch (error) {
    null
  }
}
```

- let fix also the types to accept or add a field to the user isOAuth:bolean

```ts
import { type DefaultSession } from 'next-auth'

// Brad placed this in a next-auth.d.ts file

import { UserRole } from '@prisma/client'

// flow used t inject values to types in nextauth
export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole
  isTwoFactorEnabled: boolean
  isOAuth: boolean
}

declare module 'next-auth' {
  interface Session {
    user?: ExtendedUser
  }
}
```

- So we have to modify the prisma.schema too then
- And also we can now grab the account in the auth callbacks
- hm, interesting, but we are not touching the actual prisma model or database, we adding the logic to the just to the session really

```ts
import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './lib/db'
import { getUserById } from './helpers/user/getUserById'
import { UserRole } from '@prisma/client'
import { getTwoFactorConfirmationByUserId } from './helpers/data/getTwofactorConfirmation'
import { accountsActions } from './actions/accountsActions'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
  callbacks: {
    // hover over session to see options
    async signIn({ user, account }) {
      // aloow OAuth witjhout email verification
      //Althought I odnt think we need it, becasue if social an email will be verifoed one the spot
      if (account?.provider !== 'credentials') return true
      const existingUser = await getUserById(user.id)
      //prevent signin without email verification
      if (!existingUser || !existingUser.emailVerified) {
        return false
      }
      // prevent sign in if twofactorAuthenticaton is enabled
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        )
        if (!twoFactorConfirmation) return false
        //Delete twoFactor Confirmation for the next sign in
        // await db.twoFactorToken.delete({
        //   where: { id: twoFactorConfirmation.id },
        // })
      }
      return true
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.userRole && session.user) {
        session.user.role = token.userRole as UserRole
      }
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.name = token.name
        session.user.email = token.email
        session.user.isOAuth = token.isOAuth as boolean //new
      }
      return session
    },
    async jwt({ token }) {
      console.log('Im being called again')

      if (!token.sub) return token
      const user = await getUserById(token.sub as string)

      if (!user) return token

      const account = await accountsActions(user.id)

      token.isOAuth = !!account //new
      token.email = user.email
      token.name = user.name
      token.userRole = user.role
      token.isTwoFactorEnabled = user.isTwoFactorEnabled
      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
```

### Settign page - FORM

```ts
'use client'

import { settingsAction } from '@/actions/settingsAction'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState, useTransition } from 'react'

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
```

### Fixing things

#### Check and verify email after updating at setting page

- At setting action

```ts
// check if email you are tring to change is taken
if (email && email !== dbUser.email) {
  const existingUser = await getUserById(email)
  //if user exists and that user isnt us then error
  if (existingUser && existingUser.id !== user.id) {
    return { error: 'That email has been taken already' }
  }
  // send verificatio token to be able to the new email
  const verificationToken = await generateVerificationToken(email)
  await sendVerificationEmail(verificationToken.email, verificationToken.token)

  //Update the user to email not verified
  await db.user.update({
    where: { id: user?.id },
    data: { emailVerified: null },
  })
}
```

#### Hard reload from login page after sign in

```ts
  try {
    await signIn('credentials', {
      email,
      password,
      // redirectTo: DEFAULT_LOGIN_REDIRECT,
      redirect: false,
    })
    await db.TwoFactorConfirmation.deleteMany({
      where: { userId: existingUser.id },
    })
    // redirect(DEFAULT_LOGIN_REDIRECT)
    // for a hot reload
    // Instead of redirect()
    return { success: '/settings' }
  } catch (error) {

```

#### Receiving the response in Login Form

```ts
startTransition(() => {
loginAction(values).then((res) => {
if (res?.error) {
setError(res.error)
}
if (res?.success) {
setSuccess(res.success)
if (res.success === 'Enter two factor code') {
setShowTwoFactor(true)
}
if (res.success === '/settings') {
window.location.href = '/settings'
// router.push('/settings')
}
```

## FINAL TOUCHES

### Login Button

- we have this logic in loginButton

```ts
if (mode === 'modal') {
  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className='p-0 w-auto bg-transparent border-none'>
        <LoginForm />
      </DialogContent>
    </Dialog>
  )
}
```

- Now we just have to pass a pro of moda="modal" to have the mdal kick in instea of a redirect to /signin. we can do it right from the start

```ts
<LoginButton asChild mode='modal'>
  <Button variant='secondary' size='lg'>
    Sign in
  </Button>
</LoginButton>
```

### Login callback redirect

- this is great for going back to the same page after logout
- becuse irght now, after we log out, we are redirected to /auth/login. but maybe, we could attch a callback to the /auth/login/callback so that we trying to login again we get redirected to that callbackl url, whci is the lst url we were on
- so fisrt lets go to meddleware

```ts
// if not logged in and not in piblic route then log in!!
//  ["/"] = we say allow just "/"; not "/"/somehtingElse
if (!isLoggedIn && !isPublicRoute) {
  //so upto here is just "/" that gets added to the url
  // so that if nothing gets added we endup adding just "/" to the end, which will have no effect
  let callbackUrl = nextUrl.pathname
  //if search param is detected, its added to the callback, becoming "/searchparam"
  if (nextUrl.search) {
    callbackUrl += nextUrl.search
  }
  //because we cant read the searchParams, we have to encode that, to be able to properly attach it to the redirectURl string
  const encodedCallbackUrl = encodeURIComponent(callbackUrl)

  // return Response.redirect(new URL('/auth/login', nextUrl))
  // so now the fomr can use this callback url if there and use it!!
  return Response.redirect(
    new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
  )
}
```

- So the previous will attache a callback to the logout.
- thus the loginform can grab the callbackUrl and send it with the values to the loginAction!!
- the previous vs redirecting from the front with that callback Url, as the login is in the action, so dont try it lol.

- go to login form

```ts
const callbackUrl = searchParams.get('callbackUrl')
console.log('callbackUrl :', callbackUrl)

   loginAction(values, callbackUrl as string).then((res) => {...// noticed we added the calllbackUrl
        if (res?.error) {...
```

- now lets go to the login action
- we grab the callbckUrl
- and attch it ot the signIn redirecTo

```ts

```

## Trauble shooting issues

### rihght now we dont have redirect after sign up

- ok so we added this logic to the register form, now we redirect ,lol

```ts
const router = useRouter()
const router = useRouter()
const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
  setError('')
  setSuccess('')
  startTransition(() => {
    registerAction(values).then((res) => {
      if (res?.error) {
        setError(res.error)
      }
      if (res?.success) {
        setSuccess(res.success)
        router.push('/login')
      }
    })
  })
}
```

### Perfect, now lets deal with the double run of react

- As we get an erro wehn redirected from email, but remeber, everything is fine, its just a ract thing cuz is running on stric with next js.

- So im gonna talk to chatGPT and see how we can disable this cuz its annoying while in dev mode
- ok we just need to modify the next.config file.

```ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // new
}

module.exports = nextConfig
```

- ok thast fixed it!

### fixing the 2FA

- , seems like we have a weird lood or classs in logic and we dotn get theemail confirmation
- like its bypassed, it was working fine but i might disturbed that when fixing soemthing else. lets check!
- ok, everything is fine!! it seems like ti was the react rerender that was couing issues as all good now!!

## Deployment

- fix a few type bug after build,
- added this to script, for prisma stuff, from build error log I got this error.
- here is the solution

```ts
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "postinstall": "prisma generate" //new
}
```
