import { NextResponse } from 'next/server'
import { list, monthly } from '@modules/attendance'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const month = url.searchParams.get('month')
    const date = url.searchParams.get('date')
    try {
        if (month) return NextResponse.json(await monthly(month))
        return NextResponse.json(await list(date || undefined))
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}