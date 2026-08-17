import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const num = (v: unknown) => Number(v) || 0

const INC = { variants: true, modifiers: true }

const clean = (p: any) => ({
  ...p,
  price: Number(p.price),
  stock: Number(p.stock),
  lowStockAt: Number(p.lowStockAt),
  variants: p.variants?.map((v: any) => ({ ...v, delta: Number(v.delta) })),
  modifiers: p.modifiers?.map((m: any) => ({ ...m, delta: Number(m.delta) })),
})

export const list = async () =>
  (await prisma.product.findMany({
    where: { tenantId: DEV_TENANT_ID },
    include: INC,
    orderBy: { createdAt: 'desc' },
  })).map(clean)

export const create = async (d: any) => {
  const { variants, modifiers, ...rest } = d
  return clean(await prisma.product.create({
    data: {
      ...rest,
      tenantId: DEV_TENANT_ID,
      variants: variants?.length ? { create: variants.map((v: any) => ({ name: v.name, delta: num(v.delta) })) } : undefined,
      modifiers: modifiers?.length ? { create: modifiers.map((m: any) => ({ name: m.name, delta: num(m.delta) })) } : undefined,
    },
    include: INC,
  }))
}

export const update = async (id: string, d: any) => {
  const { variants, modifiers, ...rest } = d

  // arrays vandha → old delete + new create (owner full control)
  if (variants) await prisma.variant.deleteMany({ where: { productId: id } })
  if (modifiers) await prisma.modifier.deleteMany({ where: { productId: id } })

  return clean(await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      ...(variants ? { variants: { create: variants.map((v: any) => ({ name: v.name, delta: num(v.delta) })) } } : {}),
      ...(modifiers ? { modifiers: { create: modifiers.map((m: any) => ({ name: m.name, delta: num(m.delta) })) } } : {}),
    },
    include: INC,
  }))
}

export const remove = (id: string) => prisma.product.delete({ where: { id } })

export const bulkPrice = async (pct: number) => {
  const products = await prisma.product.findMany({ where: { tenantId: DEV_TENANT_ID } })
  for (const p of products) {
    const newPrice = Math.round(Number(p.price) * (1 + pct / 100) * 100) / 100
    await prisma.product.update({ where: { id: p.id }, data: { price: newPrice } })
  }
  return products.length
}