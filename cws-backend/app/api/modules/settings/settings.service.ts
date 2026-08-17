import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const clean = (s: any) =>
  s && { ...s, taxPct: Number(s.taxPct), servicePct: Number(s.servicePct) }

export async function get() {
  const s = await prisma.tenantSetting.findUnique({ where: { tenantId: DEV_TENANT_ID } })
  if (s) return clean(s)
  return clean(await prisma.tenantSetting.create({ data: { tenantId: DEV_TENANT_ID } }))
}

export async function upsert(data: any) {
  return clean(
    await prisma.tenantSetting.upsert({
      where: { tenantId: DEV_TENANT_ID },
      update: data,
      create: { ...data, tenantId: DEV_TENANT_ID },
    }),
  )
}