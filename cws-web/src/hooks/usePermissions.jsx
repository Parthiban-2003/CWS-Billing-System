"use client";

import { useContext, useMemo, useCallback } from "react";
import { AuthContext } from "@/contexts/AuthProvider";

export function usePermissions() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "usePermissions must be used within AuthProvider"
        );
    }

    const { user, permissions } = context;

    // Normalize roles
    const roles = useMemo(() => {
        if (Array.isArray(user?.roles)) {
            return user.roles
                .map((role) => {
                    if (typeof role === "string") {
                        return role.toUpperCase();
                    }

                    return (
                        role?.roleCode?.toUpperCase() ||
                        role?.roleName?.toUpperCase() ||
                        ""
                    );
                })
                .filter(Boolean);
        }

        // Support JWTs that contain a single `role`
        if (typeof user?.role === "string") {
            return [user.role.toUpperCase()];
        }

        return [];
    }, [user?.roles, user?.role]);

    // Privileged roles
    const isOwner = roles.includes("OWNER");

    const isSuperAdmin =
        roles.includes("SUPERADMIN") ||
        roles.includes("ADMIN") ||
        isOwner;

    // Check permission
    const hasPermission = useCallback(
        (module, action) => {
            if (!user || !module || !action) {
                return false;
            }

            // OWNER / ADMIN / SUPERADMIN have full access
            if (isSuperAdmin) {
                return true;
            }

            if (!Array.isArray(permissions) || permissions.length === 0) {
                return false;
            }

            const normalizedModule = String(module).toUpperCase();
            const normalizedAction = String(action).toUpperCase();

            return permissions.some((permission) => {
                // Format:
                // "PRODUCT_VIEW"
                if (typeof permission === "string") {
                    return (
                        permission.toUpperCase() ===
                        `${normalizedModule}_${normalizedAction}`
                    );
                }

                // Format:
                // {
                //     module: "PRODUCT",
                //     action: "VIEW",
                //     isAllowed: true
                // }
                return (
                    permission?.module?.toUpperCase() ===
                    normalizedModule &&
                    permission?.action?.toUpperCase() ===
                    normalizedAction &&
                    permission?.isAllowed === true
                );
            });
        },
        [user, permissions, isSuperAdmin]
    );

    // Check multiple permissions
    const hasAnyPermission = useCallback(
        (permissionList) => {
            if (!Array.isArray(permissionList)) {
                return false;
            }

            return permissionList.some((permission) => {
                if (typeof permission !== "string") {
                    return false;
                }

                const [module, action] = permission.split("_");

                if (!module || !action) {
                    return false;
                }

                return hasPermission(module, action);
            });
        },
        [hasPermission]
    );

    // View permission
    const canView = useCallback(
        (module) => {
            return (
                hasPermission(module, "VIEW") ||
                hasPermission(module, "READ")
            );
        },
        [hasPermission]
    );

    // Create permission
    const canCreate = useCallback(
        (module) => {
            return hasPermission(module, "CREATE");
        },
        [hasPermission]
    );

    // Update permission
    const canUpdate = useCallback(
        (module) => {
            return hasPermission(module, "UPDATE");
        },
        [hasPermission]
    );

    // Delete permission
    const canDelete = useCallback(
        (module) => {
            return hasPermission(module, "DELETE");
        },
        [hasPermission]
    );

    // Manage permission
    const canManage = useCallback(
        (module) => {
            return (
                hasPermission(module, "MANAGE") ||
                (
                    canCreate(module) &&
                    canUpdate(module) &&
                    canDelete(module)
                )
            );
        },
        [
            hasPermission,
            canCreate,
            canUpdate,
            canDelete,
        ]
    );

    return {
        user,
        permissions,
        roles,

        isSuperAdmin,
        isOwner,

        isManager: roles.includes("MANAGER"),
        isCashier: roles.includes("CASHIER"),
        isWaiter: roles.includes("WAITER"),
        isKitchen: roles.includes("KITCHEN"),

        hasPermission,
        hasAnyPermission,

        canView,
        canCreate,
        canUpdate,
        canDelete,
        canManage,
    };
}
