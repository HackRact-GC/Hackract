import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from './auth.repository.js';
import userRepository from '../user/user.repository.js';
import AppError from '../../utils/AppError.js';
import { AuthErrorCodes, TOKEN_EXPIRY } from './auth.constants.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../../config/email.js';
import prisma from '../../database/prismaClient.js';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';

class AuthService {
    /**
     * Register a new user
     */
    async register(data) {
        // Check if email already exists
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError(
                'An account with this email already exists',
                409,
                AuthErrorCodes.EMAIL_ALREADY_EXISTS
            );
        }

        // Check if handle already exists
        const existingHandle = await userRepository.findByHandle(data.handle);
        if (existingHandle) {
            throw new AppError(
                'This handle is already taken',
                409,
                AuthErrorCodes.HANDLE_ALREADY_EXISTS
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

        // Get default PENTESTER role
        const defaultRole = await prisma.role.findUnique({
            where: { type: 'PENTESTER' },
        });

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                handle: data.handle,
                provider: 'local',
                status: 'PENDING',
                isVerified: false,
                roles: defaultRole ? {
                    connect: { id: defaultRole.id },
                } : undefined,
            },
            include: { roles: true },
        });

        // Create email verification token
        const verificationToken = await authRepository.createEmailVerificationToken(user.id);

        // Send verification email
        try {
            await sendVerificationEmail(user.email, user.fullName, verificationToken.token);
        } catch (error) {
            console.error('Failed to send verification email:', error);
            // Don't throw error - user is created, they can request new verification email
        }

        // Remove password from response
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }

    /**
     * Login user
     */
    async login(email, password, userAgent = null, ipAddress = null) {
        // Find user by email
        const user = await userRepository.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new AppError(
                'Invalid email or password',
                401,
                AuthErrorCodes.INVALID_CREDENTIALS
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new AppError(
                'Invalid email or password',
                401,
                AuthErrorCodes.INVALID_CREDENTIALS
            );
        }

        // Check account status
        if (user.status === 'SUSPENDED') {
            throw new AppError(
                'Your account has been suspended. Please contact support.',
                403,
                AuthErrorCodes.ACCOUNT_SUSPENDED
            );
        }

        if (user.status === 'BANNED') {
            throw new AppError(
                'Your account has been banned. Please contact support.',
                403,
                AuthErrorCodes.ACCOUNT_BANNED
            );
        }

        // Check email verification
        if (!user.isVerified) {
            throw new AppError(
                'Please verify your email address before logging in. Check your inbox for the verification link.',
                403,
                AuthErrorCodes.EMAIL_NOT_VERIFIED,
                { userId: user.id }
            );
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshTokenData = await authRepository.createRefreshToken(user.id, userAgent, ipAddress);

        // Remove password from response
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken: refreshTokenData.token,
        };
    }

    /**
     * Verify email
     */
    async verifyEmail(token) {
        // Find token
        const verificationToken = await authRepository.findEmailVerificationToken(token);

        if (!verificationToken) {
            throw new AppError(
                'Invalid verification token',
                400,
                AuthErrorCodes.VERIFICATION_TOKEN_INVALID
            );
        }

        // Check if expired
        if (new Date() > verificationToken.expiresAt) {
            await authRepository.deleteEmailVerificationToken(token);
            throw new AppError(
                'Verification token has expired. Please request a new one.',
                400,
                AuthErrorCodes.VERIFICATION_TOKEN_EXPIRED
            );
        }

        // Check if already verified
        if (verificationToken.user.isVerified) {
            await authRepository.deleteEmailVerificationToken(token);
            throw new AppError(
                'Email is already verified',
                400,
                AuthErrorCodes.EMAIL_ALREADY_VERIFIED
            );
        }

        // Update user
        await prisma.user.update({
            where: { id: verificationToken.userId },
            data: {
                isVerified: true,
                emailVerifiedAt: new Date(),
                status: 'ACTIVE',
            },
        });

        // Delete token
        await authRepository.deleteEmailVerificationToken(token);

        // Send welcome email
        try {
            await sendWelcomeEmail(verificationToken.user.email, verificationToken.user.fullName);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }

        return {
            message: 'Email verified successfully. You can now log in.',
        };
    }

    /**
     * Resend verification email
     */
    async resendVerificationEmail(email) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            // Don't reveal if email exists
            return {
                message: 'If an account with this email exists, a verification email has been sent.',
            };
        }

        if (user.isVerified) {
            throw new AppError(
                'Email is already verified',
                400,
                AuthErrorCodes.EMAIL_ALREADY_VERIFIED
            );
        }

        // Create new verification token
        const verificationToken = await authRepository.createEmailVerificationToken(user.id);

        // Send verification email
        try {
            await sendVerificationEmail(user.email, user.fullName, verificationToken.token);
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw new AppError(
                'Failed to send verification email. Please try again later.',
                500
            );
        }

        return {
            message: 'Verification email sent. Please check your inbox.',
        };
    }

    /**
     * Forgot password - send reset email
     */
    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            // Don't reveal if email exists
            return {
                message: 'If an account with this email exists, a password reset link has been sent.',
            };
        }

        // Create password reset token
        const resetToken = await authRepository.createPasswordResetToken(user.id);

        // Send password reset email
        try {
            await sendPasswordResetEmail(user.email, user.fullName, resetToken.token);
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            throw new AppError(
                'Failed to send password reset email. Please try again later.',
                500
            );
        }

        return {
            message: 'Password reset instructions sent to your email.',
        };
    }

    /**
     * Reset password
     */
    async resetPassword(token, newPassword) {
        // Find token
        const resetToken = await authRepository.findPasswordResetToken(token);

        if (!resetToken) {
            throw new AppError(
                'Invalid reset token',
                400,
                AuthErrorCodes.RESET_TOKEN_INVALID
            );
        }

        // Check if expired
        if (new Date() > resetToken.expiresAt) {
            throw new AppError(
                'Reset token has expired. Please request a new one.',
                400,
                AuthErrorCodes.RESET_TOKEN_EXPIRED
            );
        }

        // Check if already used
        if (resetToken.used) {
            throw new AppError(
                'Reset token has already been used',
                400,
                AuthErrorCodes.RESET_TOKEN_USED
            );
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update user password
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        });

        // Mark token as used
        await authRepository.markPasswordResetTokenAsUsed(token);

        // Revoke all refresh tokens for security
        await authRepository.revokeAllUserRefreshTokens(resetToken.userId);

        return {
            message: 'Password reset successful. You can now log in with your new password.',
        };
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken) {
        // Find refresh token
        const tokenData = await authRepository.findRefreshToken(refreshToken);

        if (!tokenData) {
            throw new AppError(
                'Invalid refresh token',
                401,
                AuthErrorCodes.REFRESH_TOKEN_INVALID
            );
        }

        // Check if expired
        if (new Date() > tokenData.expiresAt) {
            throw new AppError(
                'Refresh token has expired. Please log in again.',
                401,
                AuthErrorCodes.REFRESH_TOKEN_EXPIRED
            );
        }

        // Check if revoked
        if (tokenData.revoked) {
            throw new AppError(
                'Refresh token has been revoked. Please log in again.',
                401,
                AuthErrorCodes.REFRESH_TOKEN_REVOKED
            );
        }

        // Generate new access token
        const accessToken = this.generateAccessToken(tokenData.user);

        return {
            accessToken,
            user: tokenData.user,
        };
    }

    /**
     * Logout - revoke refresh token
     */
    async logout(refreshToken) {
        try {
            await authRepository.revokeRefreshToken(refreshToken);
        } catch (error) {
            // Token might not exist, but that's okay
            console.error('Error revoking refresh token:', error);
        }

        return {
            message: 'Logged out successfully',
        };
    }

    /**
     * Logout from all devices - revoke all refresh tokens
     */
    async logoutAll(userId) {
        await authRepository.revokeAllUserRefreshTokens(userId);

        return {
            message: 'Logged out from all devices successfully',
        };
    }

    /**
     * Generate access token (JWT)
     */
    generateAccessToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            roles: user.roles?.map((r) => r.type) || [],
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
        });
    }

    /**
     * Verify access token
     */
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AppError(
                    'Access token has expired',
                    401,
                    AuthErrorCodes.EXPIRED_TOKEN
                );
            }
            throw new AppError(
                'Invalid access token',
                401,
                AuthErrorCodes.INVALID_TOKEN
            );
        }
    }
}

export default new AuthService();
