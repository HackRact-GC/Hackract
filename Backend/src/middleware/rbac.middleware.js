import AppError from '../utils/AppError.js';
import { hasPermission, hasAnyPermission, hasAllPermissions, getUserPermissions } from '../config/permissions.js';

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
