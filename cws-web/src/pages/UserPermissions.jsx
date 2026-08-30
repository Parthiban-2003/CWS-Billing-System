"use client";
import React, { useState, useEffect } from "react";
import { Users, Shield, Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import TabPanel from "@/components/userpermissions/TabPanel";
import RoleCreationTab from "@/components/userpermissions/RoleCreationTab";
import PermissionAssignTab from "@/components/userpermissions/PermissionAssignTab";
import RolePermissionAssignedTab from "@/components/userpermissions/RolePermissionAssignedTab";

export default function UserPermissionsPage() {
    // State for tabs
    const [tabValue, setTabValue] = useState(0);

    // State for data
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [rolePermissions, setRolePermissions] = useState([]);

    // Separate state for selected role in permission assign
    const [selectedRoleForAssign, setSelectedRoleForAssign] = useState(null);

    // Separate state for selected role in role permissions view
    const [selectedRoleForView, setSelectedRoleForView] = useState(null);

    // State for permission assign
    const [permissionStates, setPermissionStates] = useState([]);

    // State for loading
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    // 🔥 Helper to safely extract array from any API response structure
    const extractArray = (res) => {
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
    };

    // Load all data from APIs
    const loadAllData = async () => {
        setFetchLoading(true);
        try {
            // ✅ FIX: Use 'api' (lowercase) instead of 'API'
            const [rolesRes, permissionsRes, rolePermissionsRes] = await Promise.all([
                api.get("/api/roles"),
                api.get("/api/permissions"),
                api.get("/api/rolepermissions"),
            ]);

            //  FIX: Safely extract arrays regardless of response structure
            const rolesData = extractArray(rolesRes);
            const permissionsData = extractArray(permissionsRes);
            const rolePermissionsData = extractArray(rolePermissionsRes);

            console.log("✅ Roles:", rolesData);
            console.log("✅ Permissions:", permissionsData);
            console.log("✅ RolePermissions:", rolePermissionsData);

            setRoles(rolesData);
            setPermissions(permissionsData);
            setRolePermissions(rolePermissionsData);

            // If there's a selected role in assign tab, update its permission states
            if (selectedRoleForAssign) {
                const updatedRole = rolesData.find(
                    (r) => r.roleId === selectedRoleForAssign.roleId,
                );
                if (updatedRole) {
                    setSelectedRoleForAssign(updatedRole);
                    const rolePerms = rolePermissionsData.filter(
                        (rp) => rp.roleId === updatedRole.roleId,
                    );
                    const updatedPermissions = permissionsData.map((permission) => ({
                        ...permission,
                        isAllowed: rolePerms.some(
                            (rp) =>
                                rp.permissionId === permission.permissionId && rp.isAllowed,
                        ),
                    }));
                    setPermissionStates(updatedPermissions);
                }
            }

            // If there's a selected role in view tab, update it
            if (selectedRoleForView) {
                const updatedRole = rolesData.find(
                    (r) => r.roleId === selectedRoleForView.roleId,
                );
                if (updatedRole) {
                    setSelectedRoleForView(updatedRole);
                }
            }

            toast.success("Data loaded successfully!");
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error(error?.response?.data?.message || "Failed to load data!");
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Tab Change Handler
    const handleTabChange = (index) => {
        setTabValue(index);
    };

    // Role Creation Handlers
    const handleRolesUpdate = (updatedRoles) => {
        setRoles(updatedRoles);
    };

    // Permission Assign Handlers
    const handleSelectRoleForAssign = (role) => {
        setSelectedRoleForAssign(role);
        // Get permissions for this role
        const rolePerms = rolePermissions.filter((rp) => rp.roleId === role.roleId);
        // Update permission states - show ALL permissions with their current status
        const updatedPermissions = permissions.map((permission) => ({
            ...permission,
            isAllowed: rolePerms.some(
                (rp) => rp.permissionId === permission.permissionId && rp.isAllowed,
            ),
        }));
        setPermissionStates(updatedPermissions);
    };

    const handlePermissionToggle = (permissionId) => {
        setPermissionStates(
            permissionStates.map((p) =>
                p.permissionId === permissionId ? { ...p, isAllowed: !p.isAllowed } : p,
            ),
        );
    };

    const handleSavePermissions = async () => {
        if (!selectedRoleForAssign) {
            toast.error("Please select a role first!");
            return;
        }

        // Create payload in the required format
        const payload = {
            roleId: selectedRoleForAssign.roleId,
            permissions: permissionStates.map((permission) => ({
                permissionId: permission.permissionId,
                isAllowed: Boolean(permission.isAllowed),
            })),
        };

        setLoading(true);
        try {
            // ✅ FIX: Use 'api' (lowercase)
            await api.post("/api/rolepermissions", payload);

            // Reload latest role permissions
            const updatedRolePermissions = await api.get("/api/rolepermissions");
            const latestRolePermissions = extractArray(updatedRolePermissions);
            setRolePermissions(latestRolePermissions);

            // Update permission states for selected role
            const rolePerms = latestRolePermissions.filter(
                (rp) => rp.roleId === selectedRoleForAssign.roleId,
            );
            const updatedPermissionStates = permissions.map((permission) => ({
                ...permission,
                isAllowed: rolePerms.some(
                    (rp) => rp.permissionId === permission.permissionId && rp.isAllowed,
                ),
            }));
            setPermissionStates(updatedPermissionStates);

            // Also update the view tab's selected role data
            if (selectedRoleForView?.roleId === selectedRoleForAssign.roleId) {
                setSelectedRoleForView(selectedRoleForAssign);
            }

            toast.success("Permissions saved successfully!");
        } catch (error) {
            console.error("Error saving permissions:", error);
            toast.error(
                error?.response?.data?.message || "Failed to save permissions!",
            );
        } finally {
            setLoading(false);
        }
    };

    // Role Permission Assigned Handlers
    const handleSelectRoleForView = (role) => {
        setSelectedRoleForView(role);
    };

    // Get action color
    const getActionColor = (action) => {
        const colors = {
            VIEW: "bg-blue-100 text-blue-800",
            CREATE: "bg-green-100 text-green-800",
            UPDATE: "bg-yellow-100 text-yellow-800",
            DELETE: "bg-red-100 text-red-800",
            APPROVE: "bg-purple-100 text-purple-800",
            READ: "bg-sky-100 text-sky-800",
            MANAGE: "bg-indigo-100 text-indigo-800",
            EXECUTE: "bg-violet-100 text-violet-800",
        };
        return colors[action] || "bg-gray-100 text-gray-800";
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <Shield className="text-blue-600" size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            User Permissions Management
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Manage roles and permissions for your application
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadAllData}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        {loading ? "Loading..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px overflow-x-auto">
                        <button
                            onClick={() => handleTabChange(0)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tabValue === 0
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <Users size={18} />
                            Role Creation
                            <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                {roles.length}
                            </span>
                        </button>
                        <button
                            onClick={() => handleTabChange(1)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tabValue === 1
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <Key size={18} />
                            Permission Assign
                            {selectedRoleForAssign && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                    {selectedRoleForAssign.roleName}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange(2)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tabValue === 2
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <Shield size={18} />
                            Role Permission Assigned
                            {selectedRoleForView && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                    {selectedRoleForView.roleName}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Tab 1: Role Creation */}
                <TabPanel value={tabValue} index={0}>
                    <RoleCreationTab
                        roles={roles}
                        onRolesUpdate={handleRolesUpdate}
                        loadAllData={loadAllData}
                    />
                </TabPanel>

                {/* Tab 2: Permission Assign */}
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

                {/* Tab 3: Role Permission Assigned */}
                <TabPanel value={tabValue} index={2}>
                    <RolePermissionAssignedTab
                        roles={roles}
                        permissions={permissions}
                        selectedRole={selectedRoleForView}
                        onSelectRole={handleSelectRoleForView}
                        getActionColor={getActionColor}
                    />
                </TabPanel>
            </div>
        </div>
    );
}