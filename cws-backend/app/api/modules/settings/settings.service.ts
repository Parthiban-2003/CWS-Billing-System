import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const clean = (s: any) =>
  s && {
    ...s,
    taxPct: Number(s.taxPct ?? 0),
    servicePct: Number(s.servicePct ?? 0),
    happyPct: Number(s.happyPct ?? 0),
    whatsappEnabled: Boolean(s.whatsappEnabled ?? false),
    whatsappApiKey: s.whatsappApiKey ?? null,
    ownerPhone: s.ownerPhone ?? null,
    loyaltyEnabled: Boolean(s.loyaltyEnabled ?? false),
  }

export async function get() {
  const s = await prisma.tenantSetting.findUnique({ where: { tenantId: DEV_TENANT_ID } })
  if (s) return clean(s)
  return clean(await prisma.tenantSetting.create({ data: { tenantId: DEV_TENANT_ID } }))
}

export async function upsert(data: any) {
  const allowed: any = {}
  const validKeys = [
    'companyName', 'phone', 'email', 'address', 'gstin',
    'taxPct', 'servicePct', 'happyStart', 'happyEnd', 'happyPct',
    'loyaltyEnabled',
    'whatsappEnabled', 'whatsappApiKey', 'ownerPhone',
  ]
  for (const k of validKeys) {
    if (k in data) allowed[k] = data[k]
  }

  return clean(
    await prisma.tenantSetting.upsert({
      where: { tenantId: DEV_TENANT_ID },
      update: allowed,
      create: { ...allowed, tenantId: DEV_TENANT_ID },
    }),
  )
}