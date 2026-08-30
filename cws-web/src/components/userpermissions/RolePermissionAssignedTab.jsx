import { useMemo, useState } from 'react'
import {
    Shield, Search, Lock, CheckCircle, AlertCircle, Users, Key,
    RefreshCw, ChevronDown, ChevronRight, X, Crown, Star, Award,
    Minus, Grid, List, BadgeCheck, Fingerprint,
} from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const ACTION_COLORS = {
    CREATE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    READ: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    UPDATE: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    DELETE: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    EXECUTE: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    MANAGE: 'bg-primary-soft text-primary border-primary/30',
    VIEW: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    APPROVE: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
    REJECT: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const getActionColor = (action) => ACTION_COLORS[action] || 'bg-bg text-mut border border-line'

export default function RolePermissionAssignedTab({
    roles = [],
    permissions = [],
    selectedRole = null,
    onSelectRole = () => { },
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterModule, setFilterModule] = useState('ALL')
    const [rolePermissions, setRolePermissions] = useState([])
    const [loading, setLoading] = useState(false)
    const [expandedModules, setExpandedModules] = useState(new Set())
    const [viewMode, setViewMode] = useState('grid')

    const fetchRolePermissions = async (roleId) => {
        if (!roleId) {
            setRolePermissions([])
            return
        }
        try {
            setLoading(true)
            const res = await api.get(`/api/rolepermissions?roleId=${roleId}`)
            const data = res?.data || res || []
            setRolePermissions(data)
        } catch (e) {
            console.error('Fetch error:', e)
            setRolePermissions([])
        } finally {
            setLoading(false)
        }
    }

    const modules = useMemo(() => {
        return ['ALL', ...new Set(permissions.map((p) => p.module).filter(Boolean))]
    }, [permissions])

    const selectedRolePermissions = useMemo(() => {
        if (!selectedRole?.roleId) return []
        return rolePermissions
            .filter((rp) => {
                const a = rp.isAllowed
                return a === true || a === 1 || a === '1' || a === 'true' || a === 'TRUE'
            })
            .map((rp) => {
                const p = permissions.find((x) => String(x.permissionId) === String(rp.permissionId))
                if (!p) return null
                return { ...p, ...rp, isAllowed: true }
            })
            .filter(Boolean)
    }, [selectedRole, rolePermissions, permissions])

    const filtered = useMemo(() => {
        const s = String(searchTerm || '').toLowerCase()
        return selectedRolePermissions.filter((p) => {
            const name = String(p.permissionName || '').toLowerCase()
            const code = String(p.permissionCode || '').toLowerCase()
            const mod = String(p.module || '').toLowerCase()
            const matchSearch = name.includes(s) || code.includes(s)
            const matchModule = filterModule === 'ALL' || mod === filterModule.toLowerCase()
            return matchSearch && matchModule
        })
    }, [selectedRolePermissions, searchTerm, filterModule])

    const grouped = useMemo(() => {
        return filtered.reduce((acc, p) => {
            const m = p.module || 'General'
            if (!acc[m]) acc[m] = []
            acc[m].push(p)
            return acc
        }, {})
    }, [filtered])

    const toggleExpand = (module) => {
        setExpandedModules((prev) => {
            const s = new Set(prev)
            s.has(module) ? s.delete(module) : s.add(module)
            return s
        })
    }

    const getLevelBadge = (level) => {
        if (level >= 80) return { label: 'Critical', icon: Crown, color: 'text-rose-400' }
        if (level >= 50) return { label: 'High', icon: Award, color: 'text-amber-400' }
        if (level >= 30) return { label: 'Medium', icon: Star, color: 'text-primary' }
        return { label: 'Low', icon: Minus, color: 'text-emerald-400' }
    }

    const getRolePermCount = (roleId) => {
        if (String(selectedRole?.roleId) === String(roleId)) return selectedRolePermissions.length
        return 0
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* ROLE LIST */}
            <div className="lg:col-span-1">
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-line bg-primary/5">
                        <div className="flex items-center gap-2">
                            <Shield className="text-primary" size={20} />
                            <h3 className="text-base font-extrabold text-ink">Select Role</h3>
                        </div>
                        <p className="text-xs text-mut mt-1">View assigned permissions</p>
                    </div>

                    <div className="p-2 space-y-1.5 max-h-[600px] overflow-y-auto">
                        {roles.map((role) => {
                            const sel = String(selectedRole?.roleId) === String(role.roleId)
                            const count = getRolePermCount(role.roleId)
                            const badge = getLevelBadge(role.roleLevel)
                            return (
                                <button
                                    key={role.roleId}
                                    type="button"
                                    onClick={() => {
                                        onSelectRole(role)
                                        fetchRolePermissions(role.roleId)
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left',
                                        sel
                                            ? 'bg-primary text-bg shadow-md'
                                            : 'bg-bg hover:bg-bg/80 text-ink border border-line hover:border-primary/50',
                                        loading && 'opacity-60 cursor-wait'
                                    )}
                                >
                                    <div className={cn('p-2 rounded-lg flex-shrink-0', sel ? 'bg-bg/20' : 'bg-primary-soft')}>
                                        <Shield size={16} className={sel ? 'text-bg' : 'text-primary'} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold truncate text-sm">{role.roleName}</span>
                                            {role.isSystemRole && (
                                                <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', sel ? 'bg-bg/20 text-bg' : 'bg-primary-soft text-primary')}>
                                                    System
                                                </span>
                                            )}
                                        </div>
                                        <div className={cn('text-xs truncate', sel ? 'text-bg/70' : 'text-mut')}>
                                            {role.roleCode}
                                            {role.roleLevel !== undefined && (
                                                <span className={cn('ml-1', sel ? 'text-bg/70' : badge.color)}>
                                                    • Level {role.roleLevel}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {sel && loading ? (
                                            <RefreshCw size={14} className="animate-spin text-bg/80" />
                                        ) : (
                                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold', sel ? 'bg-bg/20 text-bg' : 'bg-card border border-line text-mut')}>
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                        {roles.length === 0 && (
                            <div className="text-center py-8 text-mut">
                                <Users className="mx-auto text-mut/40" size={32} />
                                <p className="mt-2 text-sm font-bold">No roles available</p>
                                <p className="text-xs mt-1">Create a role first</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* PERMISSIONS VIEW */}
            <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                    <div className="p-4 border-b border-line bg-bg/50">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Key className="text-primary" size={20} />
                                    <h3 className="text-base font-extrabold text-ink">
                                        {selectedRole ? `Permissions — ${selectedRole.roleName}` : 'Permission Viewer'}
                                    </h3>
                                </div>
                                {selectedRole && (
                                    <p className="text-xs text-mut mt-1">
                                        <span>{selectedRolePermissions.length} permission{selectedRolePermissions.length !== 1 ? 's' : ''} assigned</span>
                                        {selectedRole.isSystemRole && (
                                            <span className="ml-2 inline-flex items-center gap-1 text-primary font-bold">
                                                <Lock size={12} /> System Role
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>
                            {selectedRole && (
                                <div className="flex bg-bg border border-line rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={cn('p-1.5 rounded transition', viewMode === 'grid' ? 'bg-primary text-bg' : 'text-mut hover:text-ink')}
                                        title="Grid View"
                                    >
                                        <Grid size={14} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn('p-1.5 rounded transition', viewMode === 'list' ? 'bg-primary text-bg' : 'text-mut hover:text-ink')}
                                        title="List View"
                                    >
                                        <List size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedRole ? (
                        <>
                            {/* Search + Filter */}
                            <div className="p-3 border-b border-line bg-bg/30">
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex-1 min-w-[200px] relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mut" />
                                        <input
                                            type="text"
                                            placeholder="Search permissions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-bg border border-line rounded-lg focus:outline-none focus:border-primary text-sm text-ink"
                                        />
                                    </div>
                                    <select
                                        value={filterModule}
                                        onChange={(e) => setFilterModule(e.target.value)}
                                        className="px-3 py-2 bg-bg border border-line rounded-lg focus:outline-none focus:border-primary text-sm text-ink min-w-[140px]"
                                    >
                                        {modules.map((m) => (
                                            <option key={m} value={m}>
                                                {m === 'ALL' ? '📋 All Modules' : m}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('')
                                            setFilterModule('ALL')
                                        }}
                                        className="px-3 py-2 text-mut hover:text-rose-400 rounded-lg border border-line hover:border-rose-500/50"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <RefreshCw className="mx-auto text-primary animate-spin" size={32} />
                                        <p className="mt-3 text-mut font-bold text-sm">Loading permissions...</p>
                                    </div>
                                ) : filtered.length > 0 ? (
                                    Object.entries(grouped).map(([module, perms]) => {
                                        const expanded = expandedModules.has(module)
                                        return (
                                            <div key={module} className="border border-line rounded-lg overflow-hidden">
                                                <div
                                                    className={cn(
                                                        'flex items-center justify-between p-2.5 cursor-pointer transition-colors',
                                                        expanded ? 'bg-primary/5' : 'bg-bg/50'
                                                    )}
                                                    onClick={() => toggleExpand(module)}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <button className="flex-shrink-0">
                                                            {expanded ? (
                                                                <ChevronDown size={16} className="text-mut" />
                                                            ) : (
                                                                <ChevronRight size={16} className="text-mut" />
                                                            )}
                                                        </button>
                                                        <span className="font-bold text-ink text-sm">{module}</span>
                                                        <span className="text-[10px] text-mut font-bold">
                                                            {perms.length} permission{perms.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>

                                                {expanded && (
                                                    <div className="p-2 bg-card border-t border-line">
                                                        {viewMode === 'grid' ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                                {perms.map((p) => (
                                                                    <div
                                                                        key={p.permissionId}
                                                                        className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                                                                    >
                                                                        <div className="p-1 bg-emerald-500/20 rounded">
                                                                            <CheckCircle className="text-emerald-400 flex-shrink-0" size={13} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-xs font-bold text-ink truncate block">
                                                                                {p.permissionName}
                                                                            </span>
                                                                            <span className="text-[10px] text-mut truncate block">
                                                                                {p.permissionCode}
                                                                            </span>
                                                                        </div>
                                                                        <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded border', getActionColor(p.action))}>
                                                                            {p.action}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                {perms.map((p) => (
                                                                    <div
                                                                        key={p.permissionId}
                                                                        className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                                                                    >
                                                                        <CheckCircle className="text-emerald-400 flex-shrink-0" size={13} />
                                                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                                                            <span className="text-xs font-bold text-ink">{p.permissionName}</span>
                                                                            <span className="text-[10px] text-mut">{p.permissionCode}</span>
                                                                        </div>
                                                                        <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded border', getActionColor(p.action))}>
                                                                            {p.action}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                                            <AlertCircle className="text-amber-400" size={28} />
                                        </div>
                                        <p className="mt-3 text-ink font-bold text-sm">No permissions assigned</p>
                                        <p className="text-xs text-mut mt-1">
                                            {searchTerm || filterModule !== 'ALL'
                                                ? 'No matching permissions found'
                                                : `${selectedRole.roleName} has no permissions assigned`}
                                        </p>
                                        {(searchTerm || filterModule !== 'ALL') && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('')
                                                    setFilterModule('ALL')
                                                }}
                                                className="mt-2 text-xs text-primary font-bold hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="p-3 border-t border-line bg-bg/30">
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-mut font-bold">Role:</span>
                                            <span className="font-extrabold text-ink">{selectedRole.roleName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-mut font-bold">Assigned:</span>
                                            <span className="font-extrabold text-emerald-400">{selectedRolePermissions.length}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-mut font-bold">Modules:</span>
                                            <span className="font-extrabold text-primary">{Object.keys(grouped).length}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-mut">
                                        <BadgeCheck size={12} className="text-emerald-400" />
                                        <span className="font-bold">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-10 text-center">
                            <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-3">
                                <Shield className="text-primary" size={32} />
                            </div>
                            <h4 className="text-base font-extrabold text-ink mb-1">Select a Role</h4>
                            <p className="text-xs text-mut max-w-sm mx-auto">
                                Choose a role from the left panel to view its assigned permissions.
                            </p>
                            <div className="mt-4 flex justify-center gap-3 text-[10px] text-mut">
                                <span className="flex items-center gap-1"><CheckCircle size={11} className="text-emerald-400" /> Assigned</span>
                                <span className="flex items-center gap-1"><Lock size={11} /> System Role</span>
                                <span className="flex items-center gap-1"><Key size={11} /> Permissions</span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}