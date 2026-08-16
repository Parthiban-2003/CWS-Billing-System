import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const num = (v: unknown) => Number(v) || 0

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const b = await req.json()
  const e = await prisma.expense.update({
    where: { id },
    data: { category: b.category, note: b.note, party: b.party, method: b.method, amount: num(b.amount) },
  })
  return NextResponse.json({ ...e, amount: Number(e.amount) })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.expense.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}