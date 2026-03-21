/**
 * Role-based permissions configuration
 * Each role has a set of permissions that define what actions they can perform
 */

export const PERMISSIONS = {
    // User permissions
    USER_READ: 'user:read',
    USER_WRITE: 'user:write',
    USER_DELETE: 'user:delete',
    USER_MANAGE: 'user:manage',

    // Organization permissions
    ORG_READ: 'org:read',
    ORG_WRITE: 'org:write',
    ORG_DELETE: 'org:delete',
    ORG_MANAGE: 'org:manage',
    ORG_INVITE: 'org:invite',

    // Pentest permissions
    PENTEST_READ: 'pentest:read',
    PENTEST_WRITE: 'pentest:write',
    PENTEST_DELETE: 'pentest:delete',
    PENTEST_MANAGE: 'pentest:manage',

    // Finding permissions
    FINDING_READ: 'finding:read',
    FINDING_WRITE: 'finding:write',
    FINDING_DELETE: 'finding:delete',
    FINDING_VERIFY: 'finding:verify',

    // Role permissions
    ROLE_READ: 'role:read',
    ROLE_WRITE: 'role:write',
    ROLE_ASSIGN: 'role:assign',

    // AI Assistant permissions
    AI_READ: 'ai:read',
    AI_WRITE: 'ai:write',
    AI_MANAGE: 'ai:manage',

    // Audit log permissions
    AUDIT_READ: 'audit:read',

    // All permissions (wildcard)
    ALL: '*',
};

/**
 * Role-to-permissions mapping
 */
export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: [PERMISSIONS.ALL], // Super admin has all permissions

    ORG_ADMIN: [
        // Organization management
        PERMISSIONS.ORG_READ,
        PERMISSIONS.ORG_WRITE,
        PERMISSIONS.ORG_MANAGE,
        PERMISSIONS.ORG_INVITE,

        // Pentest management within org
        PERMISSIONS.PENTEST_READ,
        PERMISSIONS.PENTEST_WRITE,
        PERMISSIONS.PENTEST_DELETE,
        PERMISSIONS.PENTEST_MANAGE,

        // Finding management
        PERMISSIONS.FINDING_READ,
        PERMISSIONS.FINDING_WRITE,
        PERMISSIONS.FINDING_DELETE,
        PERMISSIONS.FINDING_VERIFY,

        // User management within org
        PERMISSIONS.USER_READ,

        // AI Assistant
        PERMISSIONS.AI_READ,
        PERMISSIONS.AI_WRITE,
        PERMISSIONS.AI_MANAGE,

        // Audit logs
        PERMISSIONS.AUDIT_READ,

        // Role viewing
        PERMISSIONS.ROLE_READ,
    ],

    PENTESTER: [
        // Pentest access
        PERMISSIONS.PENTEST_READ,
        PERMISSIONS.PENTEST_WRITE,

        // Finding management
        PERMISSIONS.FINDING_READ,
        PERMISSIONS.FINDING_WRITE,
        PERMISSIONS.FINDING_DELETE,

        // AI Assistant
        PERMISSIONS.AI_READ,
        PERMISSIONS.AI_WRITE,

        // Organization read
        PERMISSIONS.ORG_READ,

        // User read (own profile)
        PERMISSIONS.USER_READ,
    ],

    PROJECT_ADMIN: [
        // Project/pentest lead access (scoped in code by pentestId/org membership)
        PERMISSIONS.PENTEST_READ,
        PERMISSIONS.PENTEST_WRITE,
        PERMISSIONS.PENTEST_MANAGE,

        // Finding management
        PERMISSIONS.FINDING_READ,
        PERMISSIONS.FINDING_WRITE,
        PERMISSIONS.FINDING_DELETE,
        PERMISSIONS.FINDING_VERIFY,

        // AI Assistant
        PERMISSIONS.AI_READ,
        PERMISSIONS.AI_WRITE,

        // Organization read
        PERMISSIONS.ORG_READ,

        // User read
        PERMISSIONS.USER_READ,

        // Audit logs (read)
        PERMISSIONS.AUDIT_READ,
    ],
};

/**
 * Get permissions for a given role type
 */
export const getPermissionsForRole = (roleType) => {
    return ROLE_PERMISSIONS[roleType] || [];
};

/**
 * Get all permissions for a user based on their roles
 */
export const getUserPermissions = (userRoles) => {
    const permissions = new Set();

    userRoles.forEach((role) => {
        const rolePerms = getPermissionsForRole(role.type);
        rolePerms.forEach((perm) => permissions.add(perm));
    });

    return Array.from(permissions);
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (userRoles, requiredPermission) => {
    const userPermissions = getUserPermissions(userRoles);

    // Check for wildcard permission (super admin)
    if (userPermissions.includes(PERMISSIONS.ALL)) {
        return true;
    }

    // Check for specific permission
    return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (userRoles, requiredPermissions) => {
    return requiredPermissions.some((perm) => hasPermission(userRoles, perm));
};

/**
 * Check if user has all of the required permissions
 */
export const hasAllPermissions = (userRoles, requiredPermissions) => {
    return requiredPermissions.every((perm) => hasPermission(userRoles, perm));
};
