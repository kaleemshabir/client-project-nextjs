import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if route is protected
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/signin') || 
                      request.nextUrl.pathname.startsWith('/signup')

  // If route is protected and not authenticated, redirect to signin
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/signin', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If route is auth and already authenticated, redirect to dashboard
  if (isAuthRoute && session) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Specify which routes this middleware should run on (all routes)
export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup', '/'],
} 