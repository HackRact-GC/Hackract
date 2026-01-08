import asyncHandler from 'express-async-handler';
import authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import passport from '../../config/passport.js';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.validatedBody);

    ApiResponse.created(res, result, result.message);
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.validatedBody;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await authService.login(email, password, userAgent, ipAddress);

    ApiResponse.success(res, result, 'Login successful');
});

/**
 * Verify email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.validatedBody || req.query;

    const result = await authService.verifyEmail(token);

    ApiResponse.success(res, null, result.message);
});

/**
 * Resend verification email
 */
export const resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.validatedBody;

    const result = await authService.resendVerificationEmail(email);

    ApiResponse.success(res, null, result.message);
});

/**
 * Forgot password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.validatedBody;

    const result = await authService.forgotPassword(email);

    ApiResponse.success(res, null, result.message);
});

/**
 * Reset password
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.validatedBody;

    const result = await authService.resetPassword(token, newPassword);

    ApiResponse.success(res, null, result.message);
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.validatedBody;

    const result = await authService.refreshAccessToken(refreshToken);

    const { passwordHash, ...userWithoutPassword } = result.user;

    ApiResponse.success(res, {
        accessToken: result.accessToken,
        user: userWithoutPassword,
    }, 'Token refreshed successfully');
});

/**
 * Logout
 */
export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.validatedBody;

    const result = await authService.logout(refreshToken);

    ApiResponse.success(res, null, result.message);
});

/**
 * Logout from all devices
 */
export const logoutAll = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await authService.logoutAll(userId);

    ApiResponse.success(res, null, result.message);
});

/**
 * Google OAuth - Initiate
 */
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});

/**
 * Google OAuth - Callback
 */
export const googleAuthCallback = [
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    }),
    asyncHandler(async (req, res) => {
        // User is authenticated via passport, available in req.user
        const user = req.user;
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Generate tokens
        const accessToken = authService.generateAccessToken(user);
        const refreshTokenData = await authService.createRefreshToken(user.id, userAgent, ipAddress);

        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshTokenData.token}`;

        res.redirect(redirectUrl);
    }),
];

/**
 * Get current authenticated user
 */
export const me = asyncHandler(async (req, res) => {
    const { passwordHash, ...userWithoutPassword } = req.user;

    ApiResponse.success(res, { user: userWithoutPassword }, 'User retrieved successfully');
});
