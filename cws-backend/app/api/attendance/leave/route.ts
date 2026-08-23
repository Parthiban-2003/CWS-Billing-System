import { NextResponse } from 'next/server'
import { markLeave } from '@modules/attendance'

export async function POST(req: Request) {
    const { staffId, date } = await req.json()
    if (!staffId || !date) return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    return NextResponse.json(await markLeave(staffId, date))
}