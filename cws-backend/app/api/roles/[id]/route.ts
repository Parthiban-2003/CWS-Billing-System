import { NextResponse } from 'next/server'
import { update, remove } from '@modules/roles'
import { z } from 'zod'

// Schema for update (partial)
const updateSchema = z.object({
    roleCode: z.string().min(1).optional(),
    roleName: z.string().min(1).optional(),
    roleNameTamil: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    roleLevel: z.number().min(0).max(100).optional(),
    isSystemRole: z.boolean().optional(),
    isActive: z.boolean().optional(),
})

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        const parsed = updateSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues },
                { status: 400 }
            )
        }

        const data = await update(id, parsed.data)
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Role PATCH error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update role' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await remove(id)
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('Role DELETE error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete role' },
            { status: 500 }
        )
    }
}