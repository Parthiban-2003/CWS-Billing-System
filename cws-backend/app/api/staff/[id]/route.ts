import { NextResponse } from 'next/server'
import { update, remove } from '@modules/staff'
import { z } from 'zod'

const updateStaffSchema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
    role: z.string().optional(),
    roleId: z.string().uuid().optional().nullable(),
    salary: z.union([z.string(), z.number()]).transform((val) => Number(val) || 0).optional(),
    payrollType: z.enum(['FIXED', 'ATTENDANCE']).optional(),
    pin: z.string().length(4).optional().nullable(),
    joinDate: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
})

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        console.log(' Updating staff:', id, body)

        const parsed = updateStaffSchema.safeParse(body)
        if (!parsed.success) {
            console.error('❌ Validation failed:', parsed.error.issues)
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.issues },
                { status: 400 }
            )
        }

        const data = await update(id, parsed.data)
        console.log('✅ Staff updated:', data)
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('❌ Staff PATCH error:', error)
        return NextResponse.json(
            {
                error: error.message || 'Failed to update staff',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
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
        console.error('Staff DELETE error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete staff' },
            { status: 500 }
        )
    }
}