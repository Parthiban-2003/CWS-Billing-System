import { NextResponse } from 'next/server'
import { prisma } from '@/database/client'
import { updatePayroll } from '@modules/payroll'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await req.json()

    try {
        const updated = await updatePayroll(id, body)
        return NextResponse.json(updated)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    // 🔒 Safety: PAID aayiducha delete panna koodadhu!
    const record = await prisma.payroll.findUnique({ where: { id } })
    if (record?.status === 'PAID') {
      return NextResponse.json({ error: 'Cannot delete a paid record ❌' }, { status: 400 })
    }
    
    await prisma.payroll.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}