import asyncHandler from 'express-async-handler';
import authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import AppError from '../../utils/AppError.js';

/**
 * Get currently authenticated user profile
 */
export const getMe = asyncHandler(async (req, res) => {
    // req.user is already populated by the protect middleware
    const user = await authService.getUserProfile(req.user.id);

    if (!user) {
        throw new AppError('User profile not found', 404);
    }

    ApiResponse.success(res, { user }, 'User profile retrieved successfully');
});

/**
 * Logout from local device
 */
export const logout = asyncHandler(async (req, res) => {
    // With Auth0, logout usually happens on the client side by redirecting to Auth0 logout URL.
    // Locally, we just return success.
    ApiResponse.success(res, null, 'Logged out from local session');
});

/**
 * Logout from all devices (clear local session tokens)
 */
export const logoutAll = asyncHandler(async (req, res) => {
    const result = await authService.logoutAll(req.user.id);
    ApiResponse.success(res, null, result.message);
});
