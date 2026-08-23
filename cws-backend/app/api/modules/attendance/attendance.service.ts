import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const SHIFT_START = '10:00' // ⏰ late rule (settings-ku later move pannalam)

const localDate = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const clean = (a: any) => ({
  ...a,
  hours:
    a.checkIn && a.checkOut
      ? Math.round(((new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) / 3600000) * 10) / 10
      : null,
  staff: a.staff && { id: a.staff.id, name: a.staff.name, role: a.staff.role },
})

export const list = async (date?: string) =>
  (
    await prisma.attendance.findMany({
      where: { tenantId: DEV_TENANT_ID, ...(date ? { date } : {}) },
      include: { staff: true },
      orderBy: { createdAt: 'desc' },
    })
  ).map(clean)

// ⏰ PIN PUNCH — check-in / check-out auto
export const punch = async (staffId: string, pin: string) => {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } })
  if (!staff || !staff.isActive) throw new Error('Staff not found / inactive ❌')
  if (!staff.pin || staff.pin !== pin) throw new Error('Wrong PIN ❌')

  const date = localDate()
  const now = new Date()

  const existing = await prisma.attendance.findUnique({
    where: { tenantId_staffId_date: { tenantId: DEV_TENANT_ID, staffId, date } },
  })

  // 1️⃣ CHECK-IN
  if (!existing) {
    const [sh, sm] = SHIFT_START.split(':').map(Number)
    const late = now.getHours() * 60 + now.getMinutes() > sh * 60 + sm
    const rec = await prisma.attendance.create({
      data: {
        tenantId: DEV_TENANT_ID,
        staffId,
        date,
        checkIn: now,
        status: late ? 'LATE' : 'PRESENT',
      },
      include: { staff: true },
    })
    return { action: 'CHECK_IN', ...clean(rec) }
  }

  // 2️⃣ CHECK-OUT
  if (!existing.checkOut) {
    const rec = await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: now },
      include: { staff: true },
    })
    return { action: 'CHECK_OUT', ...clean(rec) }
  }

  throw new Error('Shift already completed ✅')
}

// 🌴 Mark leave (owner manual)
export const markLeave = async (staffId: string, date: string) =>
  clean(
    await prisma.attendance.upsert({
      where: { tenantId_staffId_date: { tenantId: DEV_TENANT_ID, staffId, date } },
      update: { status: 'LEAVE' },
      create: { tenantId: DEV_TENANT_ID, staffId, date, status: 'LEAVE' },
      include: { staff: true },
    })
  )

// 📊 MONTHLY SUMMARY (payroll-ku use aagum!)
export const monthly = async (month: string) => {
  const rows = await prisma.attendance.findMany({
    where: { tenantId: DEV_TENANT_ID, date: { startsWith: month } },
    include: { staff: true },
  })
  const byStaff: Record<string, any> = {}
  for (const r of rows) {
    byStaff[r.staffId] = byStaff[r.staffId] || {
      staffId: r.staffId,
      name: r.staff?.name || '—',
      role: r.staff?.role || '',
      present: 0,
      late: 0,
      leave: 0,
      hours: 0,
    }
    const b = byStaff[r.staffId]
    if (r.status === 'PRESENT' || r.status === 'LATE') b.present++
    if (r.status === 'LATE') b.late++
    if (r.status === 'LEAVE') b.leave++
    if (r.checkIn && r.checkOut) {
      b.hours += (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 3600000
    }
  }
  return Object.values(byStaff).map((b: any) => ({ ...b, hours: Math.round(b.hours * 10) / 10 }))
}