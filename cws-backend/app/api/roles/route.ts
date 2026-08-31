import { NextResponse } from 'next/server'
import { list, create, roleSchema } from '@modules/roles'

export async function GET() {
    try {
        const data = await list()
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Roles GET error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to load roles' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = roleSchema.safeParse(body)
        
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues },
                { status: 400 }
            )
        }
        
        const data = await create(parsed.data)
        return NextResponse.json({ data }, { status: 201 })
    } catch (error: any) {
        console.error('Roles POST error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create role' },
            { status: 500 }
        )
    }
}