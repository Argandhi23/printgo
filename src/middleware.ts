import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // 1. Cek apakah user mau masuk ke halaman admin?
  if (req.nextUrl.pathname.startsWith('/admin')) {
    
    // 2. Minta browser cek header otorisasi (Basic Auth)
    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
      // Pecah kode rahasia dari browser
      const authValue = basicAuth.split(' ')[1]
      // Decode dari base64 (format: "username:password")
      const [user, pwd] = atob(authValue).split(':')

      // 3. Cek apakah username & password COCOK dengan yang di .env
      if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASSWORD) {
        // Kalau cocok, silakan masuk!
        return NextResponse.next()
      }
    }

    // 4. Kalau tidak cocok atau belum login, tolak akses (Muncul pop-up login)
    return new NextResponse('Auth Required.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  // Kalau bukan halaman admin, lewat saja
  return NextResponse.next()
}

// Tentukan halaman mana saja yang dijaga satpam
export const config = {
  matcher: '/admin/:path*',
}