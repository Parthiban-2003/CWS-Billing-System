import { NextResponse } from 'next/server'
import { list, create, wastageSchema } from '@modules/wastage'

export async function GET() {
    return NextResponse.json(await list())
}

export async function POST(req: Request) {
    const p = wastageSchema.safeParse(await req.json())
    if (!p.success) return NextResponse.json({ error: p.error.issues }, { status: 400 })
    return NextResponse.json(await create(p.data), { status: 201 })
}