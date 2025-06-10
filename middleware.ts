
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/') ||
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get('admin-session')?.value

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    try {
      const res = await fetch(`${request.nextUrl.origin}/api/admin/session`, {
        headers: {
          Cookie: `admin-session=${sessionToken}`,
        },
      })

      if (!res.ok) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url))
        response.cookies.delete('admin-session')
        return response
      }
    } catch (error) {
      console.error('Middleware session fetch error:', error)
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('admin-session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
