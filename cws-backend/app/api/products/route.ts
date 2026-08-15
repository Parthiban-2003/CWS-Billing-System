import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/schemas/product'
import { DEV_TENANT_ID } from '@/lib/tenant'

const clean = (p: any) => ({
  ...p,
  price: Number(p.price),
  stock: Number(p.stock),
  lowStockAt: Number(p.lowStockAt),
})

export async function GET() {
  const products = await prisma.product.findMany({
    where: { tenantId: DEV_TENANT_ID },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products.map(clean))
}

export async function POST(req: Request) {
  const parsed = productSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }
  const product = await prisma.product.create({
    data: { ...parsed.data, tenantId: DEV_TENANT_ID },
  })
  return NextResponse.json(clean(product), { status: 201 })
}