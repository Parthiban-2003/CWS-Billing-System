import { NextResponse } from 'next/server'
import { list, create, branchSchema } from '@modules/branches'

export async function GET() {
    try {
        const data = await list()
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Branches GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = branchSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
        }

        const data = await create(parsed.data)
        return NextResponse.json({ data }, { status: 201 })
    } catch (error: any) {
        console.error('Branches POST error:', error)
        // Handle duplicate branch code error
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Branch code already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}