import prisma from '../../database/prismaClient.js';
import { nanoid } from 'nanoid';
import { TOKEN_EXPIRY } from './auth.constants.js';

class AuthRepository {
    /**
     * Create email verification token
     */
    async createEmailVerificationToken(userId) {
        const token = nanoid(64);
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION);

        // Delete any existing tokens for this user
        await prisma.emailVerificationToken.deleteMany({
            where: { userId },
        });

        return await prisma.emailVerificationToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }

    /**
     * Find email verification token
     */
    async findEmailVerificationToken(token) {
        return await prisma.emailVerificationToken.findUnique({
            where: { token },
            include: { user: true },
        });
    }

    /**
     * Delete email verification token
     */
    async deleteEmailVerificationToken(token) {
        return await prisma.emailVerificationToken.delete({
            where: { token },
        });
    }

    /**
     * Create password reset token
     */
    async createPasswordResetToken(userId) {
        const token = nanoid(64);
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET);

        // Delete any existing unused tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId,
                used: false,
            },
        });

        return await prisma.passwordResetToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }

    /**
     * Find password reset token
     */
    async findPasswordResetToken(token) {
        return await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
    }

    /**
     * Mark password reset token as used
     */
    async markPasswordResetTokenAsUsed(token) {
        return await prisma.passwordResetToken.update({
            where: { token },
            data: {
                used: true,
                usedAt: new Date(),
            },
        });
    }

    /**
     * Create refresh token
     */
    async createRefreshToken(userId, userAgent = null, ipAddress = null) {
        const token = nanoid(64);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        return await prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
                userAgent,
                ipAddress,
            },
        });
    }

    /**
     * Find refresh token
     */
    async findRefreshToken(token) {
        return await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: { include: { roles: true } } },
        });
    }

    /**
     * Revoke refresh token
     */
    async revokeRefreshToken(token) {
        return await prisma.refreshToken.update({
            where: { token },
            data: {
                revoked: true,
                revokedAt: new Date(),
            },
        });
    }

    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllUserRefreshTokens(userId) {
        return await prisma.refreshToken.updateMany({
            where: {
                userId,
                revoked: false,
            },
            data: {
                revoked: true,
                revokedAt: new Date(),
            },
        });
    }

    /**
     * Clean up expired tokens (should be run periodically)
     */
    async cleanupExpiredTokens() {
        const now = new Date();

        const [emailTokens, resetTokens, refreshTokens] = await Promise.all([
            prisma.emailVerificationToken.deleteMany({
                where: { expiresAt: { lt: now } },
            }),
            prisma.passwordResetToken.deleteMany({
                where: { expiresAt: { lt: now } },
            }),
            prisma.refreshToken.deleteMany({
                where: { expiresAt: { lt: now } },
            }),
        ]);

        return {
            emailTokens: emailTokens.count,
            resetTokens: resetTokens.count,
            refreshTokens: refreshTokens.count,
        };
    }
}

export default new AuthRepository();
