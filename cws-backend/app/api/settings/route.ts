import { NextResponse } from 'next/server'
import { get, upsert } from '@modules/settings'

export async function GET() {
    return NextResponse.json(await get())
}

export async function PUT(req: Request) {
    return NextResponse.json(await upsert(await req.json()))
}