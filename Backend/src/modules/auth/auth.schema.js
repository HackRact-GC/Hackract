import Joi from 'joi';
import { PASSWORD_REGEX } from './auth.constants.js';

/**
 * Registration validation schema
 */
export const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),

    password: Joi.string()
        .pattern(PASSWORD_REGEX)
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required',
        }),

    confirmPassword: Joi.any()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords must match',
            'any.required': 'Confirm password is required',
        }),

    fullName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name must not exceed 100 characters',
            'any.required': 'Full name is required',
        }),

    handle: Joi.string()
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .min(3)
        .max(30)
        .optional()
        .allow('', null)
        .messages({
            'string.pattern.base': 'Handle may contain letters, numbers, underscores, or hyphens',
            'string.min': 'Handle must be at least 3 characters long',
            'string.max': 'Handle must not exceed 30 characters',
        }),

    /**
     * Optional primary role type for the user.
     * If not provided, backend will default to PENTESTER.
     */
    roleType: Joi.string()
        .valid('PENTESTER', 'ORG_ADMIN')
        .optional()
        .messages({
            'any.only': 'Invalid role selected. Choose Hacker or Organization.',
        }),
});

/**
 * Login validation schema
 */
export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required',
        }),
});

/**
 * Email verification schema
 */
export const verifyEmailSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),

    token: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            'string.pattern.base': 'Verification code must be a 6-digit number',
            'any.required': 'Verification code is required',
        }),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Reset token is required',
        }),

    newPassword: Joi.string()
        .pattern(PASSWORD_REGEX)
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'New password is required',
        }),

    confirmPassword: Joi.any()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords must match',
            'any.required': 'Confirm password is required',
        }),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'any.required': 'Refresh token is required',
        }),
});

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(422).json({
                success: false,
                error: 'Validation failed',
                errorCode: 'VALIDATION_ERROR',
                details: { errors },
                timestamp: new Date().toISOString(),
            });
        }

        req.validatedBody = value;
        next();
    };
};
