import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED = ['http://localhost:5173']

function withCors(res: NextResponse, origin: string | null) {
  if (origin && ALLOWED.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  return res
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return withCors(new NextResponse(null, { status: 204 }), origin)
  }

  return withCors(NextResponse.next(), origin)
}

export const config = { matcher: '/api/:path*' }