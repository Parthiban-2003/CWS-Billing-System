import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const num = (v: unknown) => Number(v) || 0

// 🧠 AUTO GENERATE / FETCH PAYROLL FOR A MONTH
export const getMonthlyPayroll = async (month: string) => {
  // 1. Get all active staff
  const staffList = await prisma.staff.findMany({
    where: { tenantId: DEV_TENANT_ID, isActive: true },
    include: {
      attendance: {
        where: {
          date: { startsWith: month },
          status: { in: ['PRESENT', 'LATE'] },
        },
      },
    },
  })

  const payrolls = []

  for (const s of staffList) {
    // 2. Calculate Base Amount based on Payroll Type
    let baseAmount = 0
    if (s.payrollType === 'FIXED') {
      baseAmount = num(s.salary)
    } else {
      // ATTENDANCE BASED: (Salary / 30) * Days Present
      const daysPresent = s.attendance.length
      const dailyWage = num(s.salary) / 30
      baseAmount = dailyWage * daysPresent
    }

    // 3. Upsert Payroll Record (Create if not exists, else return existing)
    const payroll = await prisma.payroll.upsert({
      where: {
        tenantId_staffId_month: { tenantId: DEV_TENANT_ID, staffId: s.id, month },
      },
      update: { baseAmount }, // Update base if attendance changed
      create: {
        tenantId: DEV_TENANT_ID,
        staffId: s.id,
        month,
        baseAmount,
        additions: 0,
        deductions: 0,
        netPay: baseAmount,
        status: 'DRAFT',
      },
      include: { staff: true },
    })

    payrolls.push({
      ...payroll,
      baseAmount: num(payroll.baseAmount),
      additions: num(payroll.additions),
      deductions: num(payroll.deductions),
      netPay: num(payroll.netPay),
      staff: { id: payroll.staff.id, name: payroll.staff.name, role: payroll.staff.role, payrollType: payroll.staff.payrollType },
    })
  }

  return payrolls
}

// ️ UPDATE ADDITIONS / DEDUCTIONS / STATUS
export const updatePayroll = async (id: string, data: any) => {
  const updates: any = {}
  if ('additions' in data) updates.additions = num(data.additions)
  if ('deductions' in data) updates.deductions = num(data.deductions)
  if ('note' in data) updates.note = data.note
  
  // If marking as paid
  if (data.status === 'PAID') {
    updates.status = 'PAID'
    updates.paidDate = new Date()
  }

  // Recalculate Net Pay if additions/deductions changed
  if ('additions' in data || 'deductions' in data) {
    const current = await prisma.payroll.findUnique({ where: { id } })
    if (current) {
      const add = num(data.additions ?? current.additions)
      const ded = num(data.deductions ?? current.deductions)
      updates.netPay = num(current.baseAmount) + add - ded
    }
  }

  return prisma.payroll.update({ where: { id }, data: updates, include: { staff: true } })
}