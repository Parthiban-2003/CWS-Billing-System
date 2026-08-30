import { NextResponse } from 'next/server'
import { logout } from '@modules/auth'

export async function POST(req: Request) {
    try {
        const { refreshToken } = await req.json()
        await logout(refreshToken)
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}