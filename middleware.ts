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
      // So we have to pass nextUrl with next js, so that it adds the domain prior to. so it becomes an absolute path
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return null
  }

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

  //allow everything else
  return null
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
