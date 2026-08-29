import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
    Users, Key, Save, CheckCircle, RefreshCw, Search, AlertCircle,
    ChevronDown, ChevronRight, Clock, Shield, Lock, Unlock, Square,
    X, Check, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const ACTION_COLORS = {
    CREATE: 'bg-emerald-500/15 text-emerald-400',
    READ: 'bg-sky-500/15 text-sky-400',
    UPDATE: 'bg-amber-500/15 text-amber-400',
    DELETE: 'bg-rose-500/15 text-rose-400',
    EXECUTE: 'bg-purple-500/15 text-purple-400',
    MANAGE: 'bg-primary-soft text-primary',
    VIEW: 'bg-cyan-500/15 text-cyan-400',
    APPROVE: 'bg-lime-500/15 text-lime-400',
    REJECT: 'bg-red-500/15 text-red-400',
}

const getActionColor = (action) => ACTION_COLORS[action] || 'bg-bg text-mut border border-line'

export default function PermissionAssignTab({
    roles = [],
    permissions = [],
    selectedRole = null,
    onSelectRole = () => { },
    onPermissionToggle = () => { },
    onSave = () => { },
    onPermissionsLoaded = () => { },
    loading = false,
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterModule, setFilterModule] = useState('ALL')
    const [permissionStates, setPermissionStates] = useState([])
    const [roleLoading, setRoleLoading] = useState(false)
    const [expandedModules, setExpandedModules] = useState(new Set())
    const [saveStatus, setSaveStatus] = useState('idle')
    const [selectedCount, setSelectedCount] = useState(0)
    const headerRef = useRef(null)
    const [isSticky, setIsSticky] = useState(false)

    const isAllowed = (v) =>
        v === true || v === 1 || v === '1' || v === 'true' || v === 'TRUE'

    // Sync from parent
    useEffect(() => {
        if (permissions?.length > 0) {
            setPermissionStates(permissions)
            const modules = new Set(
                permissions.filter((p) => isAllowed(p.isAllowed)).map((p) => p.module).filter(Boolean)
            )
            setExpandedModules(modules)
            setSelectedCount(permissions.filter((p) => isAllowed(p.isAllowed)).length)
        }
    }, [permissions])

    // Sticky detection
    useEffect(() => {
        const onScroll = () => {
            if (headerRef.current) {
                setIsSticky(headerRef.current.getBoundingClientRect().top <= 0)
            }
        }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const modules = useMemo(() => {
        const unique = new Set(permissionStates.map((p) => p.module).filter(Boolean))
        return ['ALL', ...Array.from(unique)]
    }, [permissionStates])

    const groupedPermissions = useMemo(() => {
        return permissionStates.reduce((acc, p) => {
            const m = p.module || 'General'
            if (!acc[m]) acc[m] = []
            acc[m].push(p)
            return acc
        }, {})
    }, [permissionStates])

    const filterPerms = useCallback(
        (perms) => {
            const s = searchTerm.toLowerCase().trim()
            return perms.filter((p) => {
                const name = (p?.permissionName ?? '').toLowerCase()
                const code = (p?.permissionCode ?? '').toLowerCase()
                const mod = (p?.module ?? '').toLowerCase()
                const act = (p?.action ?? '').toLowerCase()
                const matchSearch = name.includes(s) || code.includes(s) || act.includes(s)
                const matchModule = filterModule === 'ALL' || mod === filterModule.toLowerCase()
                return matchSearch && matchModule
            })
        },
        [searchTerm, filterModule]
    )

    const filteredGrouped = useMemo(() => {
        const out = {}
        Object.entries(groupedPermissions).forEach(([m, ps]) => {
            const f = filterPerms(ps)
            if (f.length > 0) out[m] = f
        })
        return out
    }, [groupedPermissions, filterPerms])

    const fetchRolePermissions = useCallback(
        async (roleId) => {
            if (!roleId) return
            try {
                setRoleLoading(true)
                const res = await api.get(`/api/rolepermissions?roleId=${roleId}`)
                const data = res?.data || res || []
                const updated = permissions.map((p) => {
                    const rp = data.find((r) => String(r.permissionId) === String(p.permissionId))
                    return { ...p, isAllowed: rp ? isAllowed(rp.isAllowed) : false }
                })
                setPermissionStates(updated)
                setSelectedCount(updated.filter((p) => isAllowed(p.isAllowed)).length)
                onPermissionsLoaded(updated)
                const mods = new Set(updated.filter((p) => isAllowed(p.isAllowed)).map((p) => p.module).filter(Boolean))
                setExpandedModules(mods)
            } catch (e) {
                console.error('Fetch error:', e)
                const reset = permissions.map((p) => ({ ...p, isAllowed: false }))
                setPermissionStates(reset)
                setSelectedCount(0)
                onPermissionsLoaded(reset)
            } finally {
                setRoleLoading(false)
            }
        },
        [permissions, onPermissionsLoaded]
    )

    const handleRoleSelect = useCallback(
        async (role) => {
            setSearchTerm('')
            setFilterModule('ALL')
            setSaveStatus('idle')
            onSelectRole(role)
            await fetchRolePermissions(role.roleId)
        },
        [onSelectRole, fetchRolePermissions]
    )

    const handleToggle = useCallback(
        (pid) => {
            const updated = permissionStates.map((p) =>
                String(p.permissionId) === String(pid) ? { ...p, isAllowed: !isAllowed(p.isAllowed) } : p
            )
            setPermissionStates(updated)
            setSelectedCount(updated.filter((p) => isAllowed(p.isAllowed)).length)
            onPermissionsLoaded(updated)
            onPermissionToggle(pid)
            const mods = new Set(updated.filter((p) => isAllowed(p.isAllowed)).map((p) => p.module).filter(Boolean))
            setExpandedModules(mods)
        },
        [permissionStates, onPermissionsLoaded, onPermissionToggle]
    )

    const toggleModuleAll = useCallback(
        (module, value) => {
            const updated = permissionStates.map((p) =>
                p.module === module ? { ...p, isAllowed: value } : p
            )
            setPermissionStates(updated)
            setSelectedCount(updated.filter((p) => isAllowed(p.isAllowed)).length)
            onPermissionsLoaded(updated)
            if (value) setExpandedModules((prev) => new Set(prev).add(module))
        },
        [permissionStates, onPermissionsLoaded]
    )

    const toggleExpand = useCallback((module) => {
        setExpandedModules((prev) => {
            const s = new Set(prev)
            s.has(module) ? s.delete(module) : s.add(module)
            return s
        })
    }, [])

    const changedCount = useMemo(() => {
        return permissionStates.filter((p, i) => {
            const orig = permissions[i]
            return orig && isAllowed(p.isAllowed) !== isAllowed(orig.isAllowed)
        }).length
    }, [permissionStates, permissions])

    const handleSave = useCallback(async () => {
        if (!selectedRole) return
        setSaveStatus('saving')
        try {
            await onSave()
            setSaveStatus('success')
            setTimeout(() => setSaveStatus('idle'), 3000)
        } catch (e) {
            setSaveStatus('error')
            setTimeout(() => setSaveStatus('idle'), 5000)
        }
    }, [selectedRole, onSave])

    const getModuleStats = (module) => {
        const mp = permissionStates.filter((p) => p.module === module)
        const total = mp.length
        const allowed = mp.filter((p) => isAllowed(p.isAllowed)).length
        return { total, allowed, pct: total > 0 ? (allowed / total) * 100 : 0 }
    }

    const isModuleFull = (module) => {
        const mp = permissionStates.filter((p) => p.module === module)
        return mp.length > 0 && mp.every((p) => isAllowed(p.isAllowed))
    }

    const SaveButton = ({ small }) => (
        <button
            type="button"
            onClick={handleSave}
            disabled={loading || roleLoading || saveStatus === 'saving'}
            className={cn(
                'relative flex items-center gap-2 rounded-lg font-bold transition-all',
                small ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm',
                saveStatus === 'saving' && 'bg-bg text-mut cursor-wait',
                saveStatus === 'success' && 'bg-emerald-500 text-bg',
                saveStatus === 'error' && 'bg-rose-500 text-bg',
                saveStatus === 'idle' && 'bg-primary text-bg hover:bg-primary/90',
                (loading || roleLoading) && 'opacity-50 cursor-not-allowed'
            )}
        >
            {saveStatus === 'saving' ? (
                <>
                    <Loader2 size={small ? 12 : 16} className="animate-spin" />
                    Saving...
                </>
            ) : saveStatus === 'success' ? (
                <>
                    <Check size={small ? 12 : 16} />
                    Saved!
                </>
            ) : saveStatus === 'error' ? (
                <>
                    <AlertCircle size={small ? 12 : 16} />
                    Retry
                </>
            ) : (
                <>
                    <Save size={small ? 12 : 16} />
                    Save Changes
                    {changedCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-amber-500 text-bg text-[10px] font-extrabold rounded-full animate-bounce">
                            {changedCount}
                        </span>
                    )}
                </>
            )}
        </button>
    )

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
                        <p className="text-xs text-mut mt-1">Choose a role to assign permissions</p>
                    </div>

                    <div className="p-2 space-y-1.5 max-h-[600px] overflow-y-auto">
                        {roles.map((role) => {
                            const sel = String(selectedRole?.roleId) === String(role.roleId)
                            const allowed = permissionStates.filter((p) => isAllowed(p.isAllowed)).length
                            const total = permissions.length
                            return (
                                <button
                                    key={role.roleId}
                                    type="button"
                                    onClick={() => handleRoleSelect(role)}
                                    disabled={roleLoading}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left',
                                        sel
                                            ? 'bg-primary text-bg shadow-md'
                                            : 'bg-bg hover:bg-bg/80 text-ink hover:border-primary/50 border border-line',
                                        roleLoading && 'opacity-60 cursor-wait'
                                    )}
                                >
                                    <div className={cn('p-2 rounded-lg flex-shrink-0', sel ? 'bg-bg/20' : 'bg-primary-soft')}>
                                        <Users size={16} className={sel ? 'text-bg' : 'text-primary'} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate text-sm">{role.roleName}</div>
                                        <div className={cn('text-xs truncate', sel ? 'text-bg/70' : 'text-mut')}>
                                            {role.roleCode}
                                            {role.isSystemRole && (
                                                <span className={cn('ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded', sel ? 'bg-bg/20 text-bg' : 'bg-primary-soft text-primary')}>
                                                    System
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {sel && roleLoading ? (
                                            <RefreshCw size={14} className="animate-spin text-bg/80" />
                                        ) : (
                                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold', sel ? 'bg-bg/20 text-bg' : 'bg-card border border-line text-mut')}>
                                                {allowed}/{total}
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

            {/* PERMISSIONS PANEL */}
            <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                    <div ref={headerRef}>
                        <div className="p-4 border-b border-line bg-bg/50">
                            <div className="flex flex-wrap justify-between items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Key className="text-primary" size={20} />
                                        <h3 className="text-base font-extrabold text-ink">
                                            {selectedRole ? `Manage — ${selectedRole.roleName}` : 'Permission Management'}
                                        </h3>
                                    </div>
                                    {selectedRole && (
                                        <p className="text-xs text-mut mt-1">
                                            {selectedRole.isSystemRole && (
                                                <span className="inline-flex items-center gap-1 mr-2 text-primary font-bold">
                                                    <Shield size={12} /> System
                                                </span>
                                            )}
                                            <span>{selectedCount} of {permissions.length} assigned</span>
                                            {changedCount > 0 && (
                                                <span className="ml-2 text-amber-400 font-bold">({changedCount} pending)</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                                {selectedRole && (
                                    <div className="flex items-center gap-2">
                                        {saveStatus === 'success' && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg">
                                                <CheckCircle size={14} className="text-emerald-400" />
                                                <span className="text-xs font-bold text-emerald-400">Saved!</span>
                                            </div>
                                        )}
                                        <SaveButton />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sticky save bar */}
                    {isSticky && selectedRole && (
                        <div className="sticky top-0 z-30 bg-card border-b border-line shadow-lg px-4 py-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Key className="text-primary" size={14} />
                                <span className="font-bold text-ink text-sm">{selectedRole?.roleName}</span>
                                <span className="text-xs text-mut">{selectedCount}/{permissions.length}</span>
                                {changedCount > 0 && (
                                    <span className="text-xs font-bold text-amber-400">{changedCount} pending</span>
                                )}
                            </div>
                            <SaveButton small />
                        </div>
                    )}

                    {selectedRole ? (
                        <>
                            {/* Search + Filter */}
                            <div className="p-3 border-b border-line bg-bg/30">
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex-1 min-w-[200px] relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mut" />
                                        <input
                                            type="text"
                                            placeholder="Search by name, code or action..."
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
                                {roleLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="mx-auto text-primary animate-spin" size={32} />
                                        <p className="mt-3 text-mut font-bold text-sm">Loading permissions...</p>
                                    </div>
                                ) : Object.keys(filteredGrouped).length > 0 ? (
                                    Object.entries(filteredGrouped).map(([module, perms]) => {
                                        const stats = getModuleStats(module)
                                        const expanded = expandedModules.has(module)
                                        const full = isModuleFull(module)
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
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-mut font-bold">
                                                                {stats.allowed}/{stats.total}
                                                            </span>
                                                            <div className="w-16 h-1 bg-bg rounded-full overflow-hidden border border-line">
                                                                <div
                                                                    className="h-full bg-primary rounded-full transition-all"
                                                                    style={{ width: `${stats.pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleModuleAll(module, !full)
                                                        }}
                                                        className={cn(
                                                            'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition',
                                                            full
                                                                ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                                                                : 'bg-bg border border-line text-mut hover:text-ink'
                                                        )}
                                                    >
                                                        {full ? (
                                                            <>
                                                                <Check size={11} /> Deselect All
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Square size={11} /> Select All
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {expanded && (
                                                    <div className="p-2 bg-card border-t border-line">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                            {perms.map((p) => {
                                                                const ok = isAllowed(p.isAllowed)
                                                                return (
                                                                    <label
                                                                        key={p.permissionId}
                                                                        className={cn(
                                                                            'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border',
                                                                            ok
                                                                                ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
                                                                                : 'bg-bg border-line hover:border-primary/50'
                                                                        )}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={ok}
                                                                            onChange={() => handleToggle(p.permissionId)}
                                                                            className="w-3.5 h-3.5 rounded border-line text-primary focus:ring-primary flex-shrink-0 cursor-pointer"
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-xs font-bold text-ink truncate block">
                                                                                {p.permissionName}
                                                                            </span>
                                                                            <span className="text-[10px] text-mut truncate block">
                                                                                {p.permissionCode}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                                                            <span className={cn('px-1.5 py-0.5 text-[9px] font-bold rounded', getActionColor(p.action))}>
                                                                                {p.action}
                                                                            </span>
                                                                            {ok && <CheckCircle size={11} className="text-emerald-400" />}
                                                                        </div>
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-10">
                                        <Search className="mx-auto text-mut/40" size={32} />
                                        <p className="mt-2 text-ink font-bold text-sm">
                                            {searchTerm || filterModule !== 'ALL' ? 'No matching permissions' : 'No permissions available'}
                                        </p>
                                        <p className="text-xs text-mut mt-1">
                                            {searchTerm || filterModule !== 'ALL'
                                                ? 'Try adjusting your search'
                                                : 'Create permissions first'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-line bg-bg/30">
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-mut font-bold">Total:</span>
                                            <span className="font-extrabold text-ink">{permissions.length}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-mut font-bold">Assigned:</span>
                                            <span className="font-extrabold text-emerald-400">{selectedCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-20 h-1.5 bg-bg rounded-full overflow-hidden border border-line">
                                                <div
                                                    className="h-full bg-emerald-400 rounded-full transition-all"
                                                    style={{ width: `${permissions.length > 0 ? (selectedCount / permissions.length) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-ink">
                                                {permissions.length > 0 ? Math.round((selectedCount / permissions.length) * 100) : 0}%
                                            </span>
                                        </div>
                                        {changedCount > 0 && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded">
                                                <AlertCircle size={11} className="text-amber-400" />
                                                <span className="text-[10px] font-bold text-amber-400">{changedCount} pending</span>
                                            </div>
                                        )}
                                    </div>
                                    {selectedRole && (
                                        <div className="flex items-center gap-1 text-[10px] text-mut">
                                            <Clock size={11} />
                                            <span>Just now</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-10 text-center">
                            <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-3">
                                <Key className="text-primary" size={32} />
                            </div>
                            <h4 className="text-base font-extrabold text-ink mb-1">Select a Role</h4>
                            <p className="text-xs text-mut max-w-sm mx-auto">
                                Choose a role from the left panel to view and modify its permissions.
                            </p>
                            <div className="mt-4 flex justify-center gap-3 text-[10px] text-mut">
                                <span className="flex items-center gap-1"><Lock size={11} /> Locked</span>
                                <span className="flex items-center gap-1"><Unlock size={11} /> Unlocked</span>
                                <span className="flex items-center gap-1"><CheckCircle size={11} className="text-emerald-400" /> Granted</span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}