import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEV_TENANT_ID } from '@/lib/tenant'

export async function GET() {
  const customers = await prisma.customer.findMany({
    where: { tenantId: DEV_TENANT_ID },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(customers)
}

export async function POST(req: Request) {
  const b = await req.json()
  const c = await prisma.customer.create({
    data: { tenantId: DEV_TENANT_ID, name: b.name, phone: b.phone },
  })
  return NextResponse.json(c, { status: 201 })
}