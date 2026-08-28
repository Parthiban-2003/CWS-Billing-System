import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'
import { generateAccessToken, generateRefreshToken, verifyPin } from '@/lib/auth'

export const login = async (staffId: string, pin: string, device?: string, ip?: string) => {
  // ✅ FIX: Include role relation
  const staff = await prisma.staff.findUnique({ 
    where: { id: staffId },
    include: { role: true } 
  })
  
  if (!staff || !staff.isActive) {
    throw new Error('Invalid credentials or account inactive')
  }

  // Check if locked
  if (staff.lockedUntil && staff.lockedUntil > new Date()) {
    throw new Error('Account locked. Try again later')
  }

  // Verify PIN
  if (!staff.pinHash || !(await verifyPin(pin, staff.pinHash))) {
    const failedAttempts = staff.failedAttempts + 1
    const lockedUntil = failedAttempts >= 5 
      ? new Date(Date.now() + 15 * 60 * 1000)
      : null

    await prisma.staff.update({
      where: { id: staffId },
      data: { failedAttempts, lockedUntil },
    })
    throw new Error('Invalid PIN')
  }

  // Resolve Role Code from relation (fallback to OWNER)
  const roleCode = staff.role?.roleCode || 'OWNER'

  // Fetch permissions
  let permissions: string[] = []
  if (staff.roleId) {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: staff.roleId, isAllowed: true },
      include: { permission: true },
    })
    permissions = rolePermissions.map(rp => rp.permission.code)
  }

  // OWNER fallback: if no permissions found, give ALL permissions
  if (roleCode === 'OWNER' && permissions.length === 0) {
    const allPerms = await prisma.permission.findMany()
    permissions = allPerms.map(p => p.code)
    console.log('🔑 OWNER granted all', permissions.length, 'permissions automatically')
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    staffId: staff.id,
    name: staff.name,
    role: roleCode,
    roleId: staff.roleId,
    permissions,
  })
  const refreshToken = generateRefreshToken()

  // Save session
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.session.create({
    data: {
      staffId: staff.id,
      refreshToken,
      device,
      ipAddress: ip,
      expiresAt,
    },
  })

  // Reset failed attempts + update last login
  await prisma.staff.update({
    where: { id: staffId },
    data: { 
      failedAttempts: 0, 
      lockedUntil: null, 
      lastLoginAt: new Date(),
    },
  })

  return {
    accessToken,
    refreshToken,
    user: {
      id: staff.id,
      name: staff.name,
      role: roleCode,
      roleId: staff.roleId,
      permissions,
    },
  }
}

export const refresh = async (refreshToken: string) => {
  const session = await prisma.session.findUnique({
    where: { refreshToken, revoked: false },
  })
  if (!session || session.expiresAt < new Date()) {
    throw new Error('Invalid or expired refresh token')
  }

  // ✅ FIX: Include role relation
  const staff = await prisma.staff.findUnique({ 
    where: { id: session.staffId },
    include: { role: true }
  })
  if (!staff || !staff.isActive) {
    throw new Error('Staff not found or inactive')
  }

  const roleCode = staff.role?.roleCode || 'OWNER'

  let permissions: string[] = []
  if (staff.roleId) {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: staff.roleId, isAllowed: true },
      include: { permission: true },
    })
    permissions = rolePermissions.map(rp => rp.permission.code)
  }

  if (roleCode === 'OWNER' && permissions.length === 0) {
    const allPerms = await prisma.permission.findMany()
    permissions = allPerms.map(p => p.code)
  }

  const accessToken = generateAccessToken({
    staffId: staff.id,
    name: staff.name,
    role: roleCode,
    roleId: staff.roleId,
    permissions,
  })

  return { accessToken }
}

export const logout = async (refreshToken: string) => {
  await prisma.session.updateMany({
    where: { refreshToken },
    data: { revoked: true },
  })
}