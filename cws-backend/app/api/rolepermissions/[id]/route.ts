import { NextResponse } from 'next/server'
import { togglePermission } from '@modules/rolepermissions'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const body = await req.json()
        const { roleId, permissionId, isAllowed } = body
        if (!roleId || !permissionId) {
            return NextResponse.json({ error: 'roleId and permissionId required' }, { status: 400 })
        }
        await togglePermission(roleId, permissionId, isAllowed)
        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}