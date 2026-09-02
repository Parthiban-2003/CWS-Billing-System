import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        return NextResponse.json(decoded)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}