import { NextResponse } from 'next/server'
import { update, remove } from '@modules/branches'
import { branchSchema } from '@modules/branches'
import { z } from 'zod'

// Partial schema for updates
const updateSchema = branchSchema.partial()

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        const parsed = updateSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
        }

        const data = await update(id, parsed.data)
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('Branch PATCH error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
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
        console.error('Branch DELETE error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}