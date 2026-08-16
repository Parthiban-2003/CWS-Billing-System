import { NextResponse } from 'next/server'
import { list, create, createTableSchema } from '@modules/tables'

export async function GET() {
    return NextResponse.json(await list())
}

export async function POST(req: Request) {
    const p = createTableSchema.safeParse(await req.json())
    if (!p.success) return NextResponse.json({ error: p.error.issues }, { status: 400 })
    return NextResponse.json(await create(p.data), { status: 201 })
}