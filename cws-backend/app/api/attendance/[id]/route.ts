import { NextResponse } from 'next/server'
import { prisma } from '@/database/client'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await req.json()

    const data: any = {}
    if (body.checkIn) data.checkIn = new Date(body.checkIn)
    if (body.checkOut) data.checkOut = new Date(body.checkOut)
    if (body.status) data.status = body.status
    if (body.note !== undefined) data.note = body.note

    const rec = await prisma.attendance.update({ where: { id }, data })
    return NextResponse.json(rec)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await prisma.attendance.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}