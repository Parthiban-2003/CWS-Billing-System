import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

export const list = () =>
  prisma.restTable.findMany({ where: { tenantId: DEV_TENANT_ID }, orderBy: { name: 'asc' } })

export const create = (d: any) =>
  prisma.restTable.create({ data: { tenantId: DEV_TENANT_ID, name: d.name, seats: d.seats ?? 4 } })

export const setStatus = (id: string, status: string) =>
  prisma.restTable.update({ where: { id }, data: { status, since: new Date() } })