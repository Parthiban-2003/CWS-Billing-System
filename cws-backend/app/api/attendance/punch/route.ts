import { NextResponse } from 'next/server'
import { punch } from '@modules/attendance'

export async function POST(req: Request) {
    const { staffId, pin } = await req.json()
    try {
        return NextResponse.json(await punch(staffId, pin || ''))
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}