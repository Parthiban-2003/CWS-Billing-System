import { NextResponse } from 'next/server'
import { getPnl } from '@modules/pnl'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const days = Number(url.searchParams.get('days') || 30)
    try {
        return NextResponse.json(await getPnl(days))
    } catch (e: any) {
        console.error('PNL ERROR:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}