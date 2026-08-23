import { NextResponse } from 'next/server'
import { listRolePermissions, assignPermissions } from '@modules/rolepermissions'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const roleId = url.searchParams.get('roleId') || undefined
    try {
        const data = await listRolePermissions(roleId)
        return NextResponse.json({ data })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { roleId, permissions } = body
        if (!roleId || !Array.isArray(permissions)) {
            return NextResponse.json({ error: 'roleId and permissions array required' }, { status: 400 })
        }
        const result = await assignPermissions(roleId, permissions)
        return NextResponse.json({ data: result })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}