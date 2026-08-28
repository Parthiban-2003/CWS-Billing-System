import { useState, useEffect } from 'react'
import { Users, Shield, Key, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TabPanel from '@/components/userpermissions/TabPanel'
import RoleCreationTab from '@/components/userpermissions/RoleCreationTab'
import PermissionAssignTab from '@/components/userpermissions/PermissionAssignTab'
import RolePermissionAssignedTab from '@/components/userpermissions/RolePermissionAssignedTab'
import { cn } from '@/lib/utils'

export default function UserPermissionsPage() {
    const [tabValue, setTabValue] = useState(0)
    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState([])
    const [rolePermissions, setRolePermissions] = useState([])
    const [selectedRoleForAssign, setSelectedRoleForAssign] = useState(null)
    const [selectedRoleForView, setSelectedRoleForView] = useState(null)
    const [permissionStates, setPermissionStates] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)

    const loadAllData = async () => {
        setFetchLoading(true)
        try {
            const [rolesRes, permissionsRes, rolePermissionsRes] = await Promise.all([
                api.get('/api/roles'),
                api.get('/api/permissions'),
                api.get('/api/rolepermissions'),
            ])
            const rolesData = rolesRes?.data || []
            const permissionsData = permissionsRes?.data || []
            const rolePermissionsData = rolePermissionsRes?.data || []

            setRoles(rolesData)
            setPermissions(permissionsData)
            setRolePermissions(rolePermissionsData)

            if (selectedRoleForAssign) {
                const updatedRole = rolesData.find((r) => r.roleId === selectedRoleForAssign.roleId)
                if (updatedRole) {
                    setSelectedRoleForAssign(updatedRole)
                    const rolePerms = rolePermissionsData.filter((rp) => rp.roleId === updatedRole.roleId)
                    const updatedPermissions = permissionsData.map((permission) => ({
                        ...permission,
                        isAllowed: rolePerms.some((rp) => rp.permissionId === permission.permissionId && rp.isAllowed),
                    }))
                    setPermissionStates(updatedPermissions)
                }
            }
            if (selectedRoleForView) {
                const updatedRole = rolesData.find((r) => r.roleId === selectedRoleForView.roleId)
                if (updatedRole) setSelectedRoleForView(updatedRole)
            }
            toast.success('Data loaded successfully!')
        } catch (error) {
            toast.error(error?.message || 'Failed to load data!')
        } finally {
            setFetchLoading(false)
        }
    }

    useEffect(() => {
        loadAllData()
    }, [])

    const handleTabChange = (index) => setTabValue(index)
    const handleRolesUpdate = (updatedRoles) => setRoles(updatedRoles)

    const handleSelectRoleForAssign = (role) => {
        setSelectedRoleForAssign(role)
        const rolePerms = rolePermissions.filter((rp) => rp.roleId === role.roleId)
        const updatedPermissions = permissions.map((permission) => ({
            ...permission,
            isAllowed: rolePerms.some((rp) => rp.permissionId === permission.permissionId && rp.isAllowed),
        }))
        setPermissionStates(updatedPermissions)
    }

    const handlePermissionToggle = (permissionId) => {
        setPermissionStates(permissionStates.map((p) => (p.permissionId === permissionId ? { ...p, isAllowed: !p.isAllowed } : p)))
    }

    const handleSavePermissions = async () => {
        if (!selectedRoleForAssign) {
            toast.error('Please select a role first!')
            return
        }
        const payload = {
            roleId: selectedRoleForAssign.roleId,
            permissions: permissionStates.map((permission) => ({
                permissionId: permission.permissionId,
                isAllowed: Boolean(permission.isAllowed),
            })),
        }
        setLoading(true)
        try {
            await api.post('/api/rolepermissions', payload)
            const updatedRolePermissions = await api.get('/api/rolepermissions')
            const latestRolePermissions = updatedRolePermissions?.data || []
            setRolePermissions(latestRolePermissions)
            const rolePerms = latestRolePermissions.filter((rp) => rp.roleId === selectedRoleForAssign.roleId)
            const updatedPermissionStates = permissions.map((permission) => ({
                ...permission,
                isAllowed: rolePerms.some((rp) => rp.permissionId === permission.permissionId && rp.isAllowed),
            }))
            setPermissionStates(updatedPermissionStates)
            if (selectedRoleForView?.roleId === selectedRoleForAssign.roleId) {
                setSelectedRoleForView(selectedRoleForAssign)
            }
            toast.success('Permissions saved successfully!')
        } catch (error) {
            toast.error(error?.message || 'Failed to save permissions!')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectRoleForView = (role) => setSelectedRoleForView(role)

    const getActionColor = (action) => {
        const colors = {
            VIEW: 'bg-sky-500/15 text-sky-400',
            CREATE: 'bg-emerald-500/15 text-emerald-400',
            UPDATE: 'bg-amber-500/15 text-amber-400',
            DELETE: 'bg-rose-500/15 text-rose-400',
            APPROVE: 'bg-purple-500/15 text-purple-400',
            READ: 'bg-primary-soft text-primary',
            EXECUTE: 'bg-purple-500/15 text-purple-400',
            MANAGE: 'bg-primary-soft text-primary',
        }
        return colors[action] || 'bg-bg text-mut border border-line'
    }

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-mut font-bold">Loading permissions...</p>
                </div>
            </div>
        )
    }

    const TABS = [
        { label: 'Role Creation', icon: Users, count: roles.length },
        { label: 'Permission Assign', icon: Key, badge: selectedRoleForAssign?.roleName },
        { label: 'Role Permissions', icon: Shield, badge: selectedRoleForView?.roleName },
    ]

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary rounded-xl">
                        <Shield className="text-bg" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-ink">🔐 User Permissions</h1>
                        <p className="text-xs text-mut font-bold">Manage roles and permissions for your application</p>
                    </div>
                </div>
                <Button variant="soft" onClick={loadAllData} disabled={loading}>
                    <RefreshCw size={14} className={cn('inline mr-1', loading && 'animate-spin')} />
                    {loading ? 'Loading...' : 'Refresh'}
                </Button>
            </div>

            {/* TABS */}
            <Card className="p-0 overflow-hidden">
                <div className="border-b border-line">
                    <nav className="flex overflow-x-auto">
                        {TABS.map((t, i) => {
                            const Icon = t.icon
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleTabChange(i)}
                                    className={cn(
                                        'flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap',
                                        tabValue === i
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-mut hover:text-ink hover:border-line'
                                    )}
                                >
                                    <Icon size={16} />
                                    {t.label}
                                    {t.count !== undefined && (
                                        <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-bg border border-line text-mut rounded-full">
                                            {t.count}
                                        </span>
                                    )}
                                    {t.badge && (
                                        <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary-soft text-primary rounded-full">
                                            {t.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                <TabPanel value={tabValue} index={0}>
                    <RoleCreationTab roles={roles} onRolesUpdate={handleRolesUpdate} loadAllData={loadAllData} />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <PermissionAssignTab
                        roles={roles}
                        permissions={permissions}
                        selectedRole={selectedRoleForAssign}
                        onSelectRole={handleSelectRoleForAssign}
                        onPermissionToggle={handlePermissionToggle}
                        onPermissionsLoaded={setPermissionStates}
                        onSave={handleSavePermissions}
                        getActionColor={getActionColor}
                        loading={loading}
                    />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <RolePermissionAssignedTab
                        roles={roles}
                        permissions={permissions}
                        selectedRole={selectedRoleForView}
                        onSelectRole={handleSelectRoleForView}
                        getActionColor={getActionColor}
                    />
                </TabPanel>
            </Card>
        </div>
    )
}