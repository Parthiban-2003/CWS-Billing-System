import { NextResponse } from 'next/server'
import { refresh } from '@modules/auth'

export async function POST(req: Request) {
    try {
        const { refreshToken } = await req.json()
        const result = await refresh(refreshToken)
        return NextResponse.json(result)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 401 })
    }
}