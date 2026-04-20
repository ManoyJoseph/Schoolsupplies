import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // Not logged in → redirect to login
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const role = profile?.role

    // Cashier trying to access admin pages → redirect to /pos
    const adminOnlyPages = ['/dashboard', '/inventory', '/reports', '/transactions']
    if (role === 'cashier' && adminOnlyPages.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/pos', request.url))
    }

    // Redirect away from login if already logged in
    if (pathname === '/login') {
      if (role === 'admin') return NextResponse.redirect(new URL('/dashboard', request.url))
      if (role === 'cashier') return NextResponse.redirect(new URL('/pos', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
