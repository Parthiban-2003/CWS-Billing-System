"use client";
import React, { useState, useMemo } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Save,
    X,
    Shield,
    Users,
    Tag,
    Info,
    Search,
    Lock,
    Unlock,
    Crown,
    Star,
    Zap,
    Award,
    TrendingUp,
    TrendingDown,
    Minus,
    Grid,
    List,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const RoleCreationTab = ({ roles, onRolesUpdate, loadAllData }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [viewMode, setViewMode] = useState('table');
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
    const [formData, setFormData] = useState({
        roleCode: '',
        roleName: '',
        roleNameTamil: '',
        description: '',
        roleLevel: 0,
        isActive: true,
    });

    // Get role level color
    const getRoleLevelColor = (level) => {
        if (level >= 80) return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200';
        if (level >= 50) return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-200';
        if (level >= 30) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200';
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-200';
    };

    // Get role level badge
    const getRoleLevelBadge = (level) => {
        if (level >= 80) return { label: 'Critical', icon: Crown, color: 'text-red-600' };
        if (level >= 50) return { label: 'High', icon: Award, color: 'text-amber-600' };
        if (level >= 30) return { label: 'Medium', icon: Star, color: 'text-blue-600' };
        return { label: 'Low', icon: Minus, color: 'text-green-600' };
    };

    // Get role level icon
    const getLevelIcon = (level) => {
        if (level >= 80) return <Crown size={14} />;
        if (level >= 50) return <Zap size={14} />;
        if (level >= 30) return <TrendingUp size={14} />;
        return <TrendingDown size={14} />;
    };

    // Get system role icon
    const getSystemIcon = (isSystem) => {
        return isSystem ? <Lock size={14} className="text-blue-600" /> : <Unlock size={14} className="text-gray-400" />;
    };

    // Filter roles
    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
            const search = searchTerm.toLowerCase().trim();
            const matchesSearch =
                role.roleCode.toLowerCase().includes(search) ||
                role.roleName.toLowerCase().includes(search) ||
                (role.roleNameTamil?.toLowerCase().includes(search) || false) ||
                (role.description?.toLowerCase().includes(search) || false);

            const matchesStatus =
                filterStatus === 'ALL' ||
                (filterStatus === 'ACTIVE' && role.isActive) ||
                (filterStatus === 'INACTIVE' && !role.isActive) ||
                (filterStatus === 'SYSTEM' && role.isSystemRole) ||
                (filterStatus === 'CUSTOM' && !role.isSystemRole);

            return matchesSearch && matchesStatus;
        });
    }, [roles, searchTerm, filterStatus]);

    // Get stats
    const stats = useMemo(() => ({
        total: roles.length,
        active: roles.filter(r => r.isActive).length,
        inactive: roles.filter(r => !r.isActive).length,
        system: roles.filter(r => r.isSystemRole).length,
        custom: roles.filter(r => !r.isSystemRole).length,
    }), [roles]);

    const handleOpenDialog = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                roleCode: role.roleCode,
                roleName: role.roleName,
                roleNameTamil: role.roleNameTamil || '',
                description: role.description || '',
                roleLevel: role.roleLevel || 0,
                isActive: role.isActive !== undefined ? role.isActive : true,
            });
        } else {
            setEditingRole(null);
            setFormData({
                roleCode: '',
                roleName: '',
                roleNameTamil: '',
                description: '',
                roleLevel: 0,
                isActive: true,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingRole(null);
    };

    const handleSubmit = async () => {
        if (!formData.roleCode || !formData.roleName) {
            toast.error('Role Code and Role Name are required!');
            return;
        }

        setLoading(true);
        try {
            if (editingRole) {
                await api.patch(`/api/roles/${editingRole.roleId}`, formData);
                toast.success('Role updated successfully!');
                await loadAllData();
            } else {
                await api.post('/api/roles', formData);
                toast.success('Role created successfully!');
                await loadAllData();
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving role:', error);
            toast.error(error?.response?.data?.message || 'Operation failed!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (roleId) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await api.delete(`/api/roles/${roleId}`);
                toast.success('Role deleted successfully!');
                await loadAllData();
            } catch (error) {
                console.error('Error deleting role:', error);
                toast.error(error?.response?.data?.message || 'Delete failed!');
            }
        }
    };

    const toggleDescription = (roleId) => {
        setExpandedDescriptions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(roleId)) {
                newSet.delete(roleId);
            } else {
                newSet.add(roleId);
            }
            return newSet;
        });
    };

    // Stat Card Component
    const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${bgColor}`}>
            <Icon size={18} className={color} />
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Create, edit, and manage roles with different permission levels
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={() => handleOpenDialog()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] font-medium"
                    >
                        <Plus size={18} />
                        Create New Role
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard
                    icon={Users}
                    label="Total Roles"
                    value={stats.total}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Active"
                    value={stats.active}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
                <StatCard
                    icon={XCircle}
                    label="Inactive"
                    value={stats.inactive}
                    color="text-rose-600"
                    bgColor="bg-rose-50"
                />
                <StatCard
                    icon={Lock}
                    label="System Roles"
                    value={stats.system}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    icon={Unlock}
                    label="Custom Roles"
                    value={stats.custom}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search roles by name, code, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm min-w-[140px]"
                    >
                        <option value="ALL"> All Roles</option>
                        <option value="ACTIVE">✅ Active</option>
                        <option value="INACTIVE">❌ Inactive</option>
                        <option value="SYSTEM">🔒 System</option>
                        <option value="CUSTOM"> Custom</option>
                    </select>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'table' ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}
                            title="Table View"
                        >
                            <Grid size={18} className={viewMode === 'table' ? 'text-blue-600' : 'text-gray-500'} />
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'cards' ? 'bg-white shadow-md' : 'hover:bg-white/50'}`}
                            title="Card View"
                        >
                            <List size={18} className={viewMode === 'cards' ? 'text-blue-600' : 'text-gray-500'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Role List */}
            {filteredRoles.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="text-blue-400" size={40} />
                    </div>
                    <p className="mt-4 text-gray-700 font-medium text-lg">
                        {searchTerm || filterStatus !== 'ALL' ? 'No matching roles found' : 'No roles created yet'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'ALL'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Click "Create New Role" to add your first role'}
                    </p>
                    {!searchTerm && filterStatus === 'ALL' && (
                        <button
                            onClick={() => handleOpenDialog()}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            Create New Role
                        </button>
                    )}
                </div>
            ) : viewMode === 'table' ? (
                /* Table View */
                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <div className="flex items-center gap-1.5">
                                        <Tag size={14} />
                                        Role Code
                                    </div>
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role Name</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tamil Name</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">System</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredRoles.map((role) => {
                                const levelBadge = getRoleLevelBadge(role.roleLevel);
                                const LevelIcon = levelBadge.icon;
                                const isExpanded = expandedDescriptions.has(role.roleId);
                                return (
                                    <tr key={role.roleId} className="hover:bg-blue-50/30 transition-all duration-150 group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${role.isSystemRole
                                                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {role.roleCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">{role.roleName}</span>
                                                {role.isSystemRole && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-sm">
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {role.roleNameTamil || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px]">
                                            <div className="flex items-start gap-1">
                                                <span className={isExpanded ? '' : 'truncate block'}>
                                                    {role.description || '—'}
                                                </span>
                                                {role.description && role.description.length > 30 && (
                                                    <button
                                                        onClick={() => toggleDescription(role.roleId)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex-shrink-0"
                                                    >
                                                        {isExpanded ? 'Show less' : '...more'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col items-start gap-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${getRoleLevelColor(role.roleLevel)}`}>
                                                        {getLevelIcon(role.roleLevel)}
                                                        {role.roleLevel}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-medium flex items-center gap-0.5 ${levelBadge.color}`}>
                                                    <LevelIcon size={10} />
                                                    {levelBadge.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                {getSystemIcon(role.isSystemRole)}
                                                <span className={`text-xs font-medium ${role.isSystemRole ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    {role.isSystemRole ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${role.isActive
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${role.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                {role.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleOpenDialog(role)}
                                                    disabled={role.isSystemRole}
                                                    className={`p-2 rounded-xl transition-all duration-200 ${role.isSystemRole
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 group-hover:scale-105'
                                                        }`}
                                                    title={role.isSystemRole ? 'System roles cannot be edited' : 'Edit role'}
                                                >
                                                    <Pencil size={17} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(role.roleId)}
                                                    disabled={role.isSystemRole}
                                                    className={`p-2 rounded-xl transition-all duration-200 ${role.isSystemRole
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 group-hover:scale-105'
                                                        }`}
                                                    title={role.isSystemRole ? 'System roles cannot be deleted' : 'Delete role'}
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoles.map((role) => {
                        const levelBadge = getRoleLevelBadge(role.roleLevel);
                        const LevelIcon = levelBadge.icon;
                        return (
                            <div key={role.roleId} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:border-blue-200 group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2.5 rounded-xl ${getRoleLevelColor(role.roleLevel)}`}>
                                            <Shield size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900">{role.roleName}</span>
                                            {role.isSystemRole && (
                                                <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
                                                    System
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${getRoleLevelColor(role.roleLevel)}`}>
                                        {getLevelIcon(role.roleLevel)}
                                        {role.roleLevel}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Tag size={14} className="text-gray-400" />
                                        <code className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{role.roleCode}</code>
                                    </div>
                                    {role.roleNameTamil && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">🇮🇳</span>
                                            <span className="text-gray-600">{role.roleNameTamil}</span>
                                        </div>
                                    )}
                                    {role.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">{role.description}</p>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${role.isActive
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${role.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                {role.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                                {getSystemIcon(role.isSystemRole)}
                                                {role.isSystemRole ? 'System' : 'Custom'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleOpenDialog(role)}
                                                disabled={role.isSystemRole}
                                                className={`p-1.5 rounded-lg transition-all duration-200 ${role.isSystemRole
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-blue-600 hover:bg-blue-50 hover:scale-110'
                                                    }`}
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role.roleId)}
                                                disabled={role.isSystemRole}
                                                className={`p-1.5 rounded-lg transition-all duration-200 ${role.isSystemRole
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-rose-600 hover:bg-rose-50 hover:scale-110'
                                                    }`}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dialog */}
            {openDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
                                    <Shield className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingRole ? 'Edit Role' : 'Create New Role'}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {editingRole ? 'Update role details' : 'Add a new role to the system'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseDialog}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                disabled={loading}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Role Code <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={formData.roleCode}
                                            onChange={(e) => setFormData({ ...formData, roleCode: e.target.value.toUpperCase() })}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white"
                                            disabled={editingRole?.isSystemRole || loading}
                                            placeholder="Enter role code (e.g., ADMIN)"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Unique identifier for the role</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Role Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.roleName}
                                            onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white"
                                            disabled={loading}
                                            placeholder="Enter role name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Role Name (Tamil)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.roleNameTamil}
                                            onChange={(e) => setFormData({ ...formData, roleNameTamil: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-white"
                                            disabled={loading}
                                            placeholder="Enter Tamil name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                    <div className="relative">
                                        <Info className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-gray-50/50 focus:bg-white"
                                            disabled={loading}
                                            placeholder="Enter role description"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Role Level (0-100)
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                value={formData.roleLevel}
                                                onChange={(e) => setFormData({ ...formData, roleLevel: parseInt(e.target.value) || 0 })}
                                                min="0"
                                                max="100"
                                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                disabled={loading}
                                            />
                                            <span className={`px-3 py-1.5 text-sm font-bold rounded-xl min-w-[40px] text-center ${getRoleLevelColor(formData.roleLevel)}`}>
                                                {formData.roleLevel}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Higher level means higher priority</p>
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="sr-only peer"
                                                    disabled={loading}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
                            <button
                                onClick={handleCloseDialog}
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md shadow-blue-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {editingRole ? 'Update Role' : 'Create Role'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleCreationTab;