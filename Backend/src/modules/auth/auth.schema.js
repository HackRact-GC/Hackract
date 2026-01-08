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
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.alphanum': 'Handle must only contain alphanumeric characters',
            'string.min': 'Handle must be at least 3 characters long',
            'string.max': 'Handle must not exceed 30 characters',
            'any.required': 'Handle is required',
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
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Verification token is required',
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
