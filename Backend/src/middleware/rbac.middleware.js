import AppError from '../utils/AppError.js';
import { hasPermission, hasAnyPermission, hasAllPermissions, getUserPermissions } from '../config/permissions.js';
import prisma from '../database/prismaClient.js';

export const RoleErrorCodes = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    ORGANIZATION_ID_REQUIRED: 'ORGANIZATION_ID_REQUIRED',
    PENTEST_ID_REQUIRED: 'PENTEST_ID_REQUIRED',
    ORGANIZATION_ADMIN_REQUIRED: 'ORGANIZATION_ADMIN_REQUIRED',
    PROJECT_ADMIN_REQUIRED: 'PROJECT_ADMIN_REQUIRED',
    PENTEST_NOT_FOUND: 'PENTEST_NOT_FOUND',
};

/**
 * Canonical role model (as per your description)
 * - SYSTEM_ADMIN: system-wide admin (maps to SUPER_ADMIN in DB)
 * - ORG_ADMIN: admin of a specific organization (scoped via OrganizationMember role)
 * - PROJECT_ADMIN: admin/lead of a specific pentest project (scoped via Pentest.leadPentesterId)
 * - PENTESTER: normal hacker/user
 */
export const Roles = Object.freeze({
    SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    ORG_ADMIN: 'ORG_ADMIN',
    PROJECT_ADMIN: 'PROJECT_ADMIN',
    PENTESTER: 'PENTESTER',
});

// DB enum role kept for backward compatibility (existing seeded users)
const DB_SUPER_ADMIN = 'SUPER_ADMIN';

const normalizeGlobalRoleType = (roleType) => {
    if (!roleType) return roleType;
    // Your meaning: SUPER_ADMIN === SYSTEM_ADMIN
    if (roleType === DB_SUPER_ADMIN) return Roles.SYSTEM_ADMIN;
    return roleType;
};

const getUserRoleTypes = (user) => {
    const roles = user?.roles || [];
    return roles.map((r) => normalizeGlobalRoleType(r.type));
};

const userHasAnyGlobalRole = (user, ...allowedRoles) => {
    const wanted = allowedRoles.map((r) => normalizeGlobalRoleType(r));
    const current = getUserRoleTypes(user);
    return current.some((r) => wanted.includes(r));
};

/**
 * Require one of the provided GLOBAL roles (SYSTEM_ADMIN is treated as SUPER_ADMIN).
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return next(new AppError('Unauthorized', 401, RoleErrorCodes.UNAUTHORIZED));
        }

        const ok = userHasAnyGlobalRole(req.user, ...allowedRoles);
        if (!ok) {
            return next(
                new AppError('You do not have permission to perform this action', 403, RoleErrorCodes.FORBIDDEN, {
                    requiredRoles: allowedRoles,
                    userRoles: (req.user.roles || []).map((r) => r.type),
                })
            );
        }

        next();
    };
};

export const requireSystemAdmin = () => requireRole(Roles.SYSTEM_ADMIN);

const getOrganizationIdFromRequest = (req, organizationIdField = 'organizationId') => {
    return (
        req.params?.[organizationIdField] ||
        req.body?.[organizationIdField] ||
        req.query?.[organizationIdField]
    );
};

/**
 * Require ORG_ADMIN for a specific organization.
 * Implementation: user must be an OrganizationMember with role 'owner' or 'admin'.
 * SYSTEM_ADMIN (SUPER_ADMIN) always passes.
 */
export const requireOrganizationAdmin = (options = {}) => {
    const { organizationIdField = 'organizationId' } = options;

    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AppError('Unauthorized', 401, RoleErrorCodes.UNAUTHORIZED));
            }

            // SYSTEM_ADMIN always passes
            if (userHasAnyGlobalRole(req.user, Roles.SYSTEM_ADMIN)) {
                return next();
            }

            const organizationId = getOrganizationIdFromRequest(req, organizationIdField);
            if (!organizationId) {
                return next(
                    new AppError('Organization ID is required', 400, RoleErrorCodes.ORGANIZATION_ID_REQUIRED, {
                        organizationIdField,
                    })
                );
            }

            const member = await prisma.organizationMember.findFirst({
                where: {
                    organizationId,
                    userId: req.user.id,
                    OR: [{ role: 'owner' }, { role: 'admin' }],
                },
                select: { id: true, role: true },
            });

            if (!member) {
                return next(
                    new AppError(
                        'Organization admin access required',
                        403,
                        RoleErrorCodes.ORGANIZATION_ADMIN_REQUIRED,
                        { organizationId, userId: req.user.id }
                    )
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

const getPentestIdFromRequest = (req, pentestIdField = 'pentestId') => {
    return req.params?.[pentestIdField] || req.body?.[pentestIdField] || req.query?.[pentestIdField];
};

/**
 * Require PROJECT_ADMIN for a specific pentest project.
 * Definition (based on your request):
 * - SYSTEM_ADMIN (SUPER_ADMIN) passes
 * - ORG_ADMIN of the pentest's organization passes
 * - The pentest lead (Pentest.leadPentesterId) passes (this is the Project Admin)
 */
export const requireProjectAdmin = (options = {}) => {
    const { pentestIdField = 'pentestId' } = options;

    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AppError('Unauthorized', 401, RoleErrorCodes.UNAUTHORIZED));
            }

            const pentestId = getPentestIdFromRequest(req, pentestIdField);
            if (!pentestId) {
                return next(
                    new AppError('Pentest ID is required', 400, RoleErrorCodes.PENTEST_ID_REQUIRED, {
                        pentestIdField,
                    })
                );
            }

            // SYSTEM_ADMIN always passes
            if (userHasAnyGlobalRole(req.user, Roles.SYSTEM_ADMIN)) {
                return next();
            }

            const pentest = await prisma.pentest.findUnique({
                where: { id: pentestId },
                select: { id: true, organizationId: true, leadPentesterId: true },
            });

            if (!pentest) {
                return next(
                    new AppError('Pentest not found', 404, RoleErrorCodes.PENTEST_NOT_FOUND, {
                        pentestId,
                    })
                );
            }

            // Project Admin = lead pentester
            if (pentest.leadPentesterId && pentest.leadPentesterId === req.user.id) {
                return next();
            }

            // ORG_ADMIN of the owning organization also passes
            const orgAdmin = await prisma.organizationMember.findFirst({
                where: {
                    organizationId: pentest.organizationId,
                    userId: req.user.id,
                    OR: [{ role: 'owner' }, { role: 'admin' }],
                },
                select: { id: true, role: true },
            });

            if (orgAdmin) {
                return next();
            }

            return next(
                new AppError('Project admin access required', 403, RoleErrorCodes.PROJECT_ADMIN_REQUIRED, {
                    pentestId,
                    organizationId: pentest.organizationId,
                    userId: req.user.id,
                    leadPentesterId: pentest.leadPentesterId,
                })
            );
        } catch (err) {
            next(err);
        }
    };
};

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
        }

        if (!hasPermission(req.user.roles, permission)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403,
                    'FORBIDDEN',
                    {
                        required: [permission],
                        current: getUserPermissions(req.user.roles),
                    }
                )
            );
        }

        next();
    };
};

/**
 * Middleware to check if user has any of the specified permissions
 */
export const requireAnyPermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
        }

        if (!hasAnyPermission(req.user.roles, permissions)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403,
                    'FORBIDDEN',
                    {
                        required: permissions,
                        current: getUserPermissions(req.user.roles),
                    }
                )
            );
        }

        next();
    };
};

/**
 * Middleware to check if user has all of the specified permissions
 */
export const requireAllPermissions = (...permissions) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
        }

        if (!hasAllPermissions(req.user.roles, permissions)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403,
                    'FORBIDDEN',
                    {
                        required: permissions,
                        current: getUserPermissions(req.user.roles),
                    }
                )
            );
        }

        next();
    };
};

/**
 * Middleware to check resource ownership
 * Allows access if user owns the resource OR has the required permission
 */
export const requireOwnershipOrPermission = (resourceUserIdField, permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
        }

        // Check if user owns the resource
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        if (resourceUserId === req.user.id) {
            return next();
        }

        // Check if user has the required permission
        if (hasPermission(req.user.roles, permission)) {
            return next();
        }

        return next(
            new AppError(
                'You do not have permission to access this resource',
                403,
                'FORBIDDEN',
                {
                    reason: 'Not owner and insufficient permissions',
                }
            )
        );
    };
};
