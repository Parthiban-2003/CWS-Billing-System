import { NextResponse } from 'next/server'
import { listRoles, createRole } from '@modules/roles'

export async function GET() {
    try {
        const data = await listRoles()
        return NextResponse.json({ data })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        if (!body.roleCode || !body.roleName) {
            return NextResponse.json({ error: 'Role code and name required' }, { status: 400 })
        }
        const data = await createRole(body)
        return NextResponse.json({ data }, { status: 201 })
    } catch (e: any) {
        if (e.code === 'P2002') {
            return NextResponse.json({ error: 'Role code already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}