import { NextResponse } from 'next/server'
import { login } from '@modules/auth'

export async function POST(req: Request) {
    try {
        const { staffId, pin, device } = await req.json()
        const ip = req.headers.get('x-forwarded-for') || 'unknown'

        const result = await login(staffId, pin, device, ip)
        return NextResponse.json(result)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 401 })
    }
}