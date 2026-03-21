import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../database/prismaClient.js';
import AppError from '../../utils/AppError.js';
import { sendVerificationEmail } from '../../utils/email.js';
import { sendPasswordResetEmail } from '../../utils/email.js';
import { AuthErrorCodes, TOKEN_EXPIRY } from '../auth/auth.constants.js';

const SALT_ROUNDS = 12;

const durationToMs = (input) => {
    if (typeof input === 'number') return input;
    const match = String(input).match(/^(\d+)([smhd])$/i);
    if (!match) return 0;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
    return value * (multipliers[unit] || 0);
};

const REFRESH_EXPIRY_MS = durationToMs(TOKEN_EXPIRY.REFRESH_TOKEN) || 7 * 24 * 60 * 60 * 1000;

class AuthService {
    sanitizeUser(user) {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }

    async getUserProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });

        if (!user) return null;
        return this.sanitizeUser(user);
    }

    async findUserByEmail(email) {
        if (!email) return null;
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { roles: true },
        });
        if (!user) return null;
        return this.sanitizeUser(user);
    }

    generateAccessToken(user) {
        if (!process.env.JWT_ACCESS_SECRET) {
            throw new AppError('Server misconfiguration: missing JWT secret', 500);
        }

        return jwt.sign(
            {
                sub: user.id,
                email: user.email,
                roles: user.roles?.map((role) => role.type) || [],
            },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN }
        );
    }

    async createRefreshToken(userId, meta) {
        const token = uuidv4();
        const expiresAt = dayjs().add(REFRESH_EXPIRY_MS, 'millisecond').toDate();

        await prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
                userAgent: meta?.userAgent,
                ipAddress: meta?.ipAddress,
            },
        });

        return { token, expiresAt };
    }

    async issueTokens(user, meta) {
        const accessToken = this.generateAccessToken(user);
        const refresh = await this.createRefreshToken(user.id, meta);

        return {
            user: this.sanitizeUser(user),
            tokens: {
                accessToken,
                refreshToken: refresh.token,
                accessTokenExpiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
                refreshTokenExpiresAt: refresh.expiresAt,
            },
        };
    }

    async createEmailVerificationToken(userId) {
        const expiresAt = dayjs().add(durationToMs(TOKEN_EXPIRY.EMAIL_VERIFICATION), 'millisecond').toDate();

        await prisma.emailVerificationToken.deleteMany({ where: { userId } });

        let token = null;
        for (let i = 0; i < 5; i++) {
            const candidate = String(Math.floor(100000 + Math.random() * 900000));
            try {
                await prisma.emailVerificationToken.create({
                    data: {
                        token: candidate,
                        userId,
                        expiresAt,
                    },
                });
                token = candidate;
                break;
            } catch (err) {
                // collision, try again
            }
        }

        if (!token) {
            throw new AppError('Could not create verification code', 500, AuthErrorCodes.EMAIL_DELIVERY_FAILED);
        }

        return { token, expiresAt };
    }

    async sendVerification(user, meta) {
        const verification = await this.createEmailVerificationToken(user.id);
        const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendBase}/verify-email?email=${encodeURIComponent(user.email)}`;

        if (process.env.NODE_ENV === 'development') {
            console.log(`\n=========================================`);
            console.log(`[DEV EMAIL SIMULATION]`);
            console.log(`To:    ${user.email}`);
            console.log(`Code:  ${verification.token}`);
            console.log(`Link:  ${verifyUrl}`);
            console.log(`=========================================\n`);
        }

        let delivered = true;
        try {
            await sendVerificationEmail({
                to: user.email,
                name: user.fullName || user.handle,
                verifyUrl,
                code: verification.token,
                expiresAt: verification.expiresAt,
                ipAddress: meta?.ipAddress,
                userAgent: meta?.userAgent,
            });
        } catch (error) {
            console.error('Failed to send verification email', error);
            delivered = false;
        }
        return { ...verification, delivered };
    }

    async verifyEmail(token, email) {
        if (!token || !email) {
            throw new AppError('Verification code and email are required', 400, AuthErrorCodes.VERIFICATION_TOKEN_INVALID);
        }

        const record = await prisma.emailVerificationToken.findFirst({
            where: { token, user: { email: email.toLowerCase() } },
            include: { user: { include: { roles: true } } },
        });

        if (!record) {
            throw new AppError('Invalid or expired verification token', 400, AuthErrorCodes.VERIFICATION_TOKEN_INVALID);
        }

        if (dayjs(record.expiresAt).isBefore(dayjs())) {
            await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });
            throw new AppError('Verification token expired', 410, AuthErrorCodes.VERIFICATION_TOKEN_EXPIRED);
        }

        const user = record.user;
        if (!user) {
            await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });
            throw new AppError('User not found', 404, AuthErrorCodes.USER_NOT_FOUND);
        }

        if (user.isVerified) {
            await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
            return { user: this.sanitizeUser(user), message: 'Email already verified' };
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                status: 'ACTIVE',
                emailVerifiedAt: new Date(),
            },
            include: { roles: true },
        });

        await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

        return {
            user: this.sanitizeUser(updatedUser),
            message: 'Email verified successfully',
        };
    }

    async createPasswordResetToken(userId) {
        const token = uuidv4();
        const expiresAt = dayjs().add(durationToMs(TOKEN_EXPIRY.PASSWORD_RESET), 'millisecond').toDate();

        await prisma.passwordResetToken.deleteMany({ where: { userId } });
        await prisma.passwordResetToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });

        return { token, expiresAt };
    }

    async forgotPassword(email, meta) {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) {
            return { message: 'If an account exists, a reset link has been sent.' };
        }

        const reset = await this.createPasswordResetToken(user.id);
        const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
        const resetUrl = `${frontendBase}/reset-password?token=${reset.token}`;

        if (process.env.NODE_ENV === 'development') {
            console.log(`\n=========================================`);
            console.log(`[DEV PASSWORD RESET SIMULATION]`);
            console.log(`To:    ${user.email}`);
            console.log(`Token: ${reset.token}`);
            console.log(`Link:  ${resetUrl}`);
            console.log(`=========================================\n`);
        }

        await sendPasswordResetEmail({
            to: user.email,
            name: user.fullName || user.handle,
            resetUrl,
            expiresAt: reset.expiresAt,
            ipAddress: meta?.ipAddress,
            userAgent: meta?.userAgent,
        });

        return { message: 'If an account exists, a reset link has been sent.' };
    }

    async resetPassword(token, newPassword) {
        if (!token) {
            throw new AppError('Reset token is required', 400, AuthErrorCodes.RESET_TOKEN_INVALID);
        }

        const record = await prisma.passwordResetToken.findUnique({ where: { token } });
        if (!record) {
            throw new AppError('Invalid or expired reset token', 400, AuthErrorCodes.RESET_TOKEN_INVALID);
        }

        if (dayjs(record.expiresAt).isBefore(dayjs()) || record.used) {
            throw new AppError('Reset token expired', 410, AuthErrorCodes.RESET_TOKEN_EXPIRED);
        }

        const user = await prisma.user.findUnique({ where: { id: record.userId } });
        if (!user) {
            throw new AppError('User not found', 404, AuthErrorCodes.USER_NOT_FOUND);
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
            prisma.passwordResetToken.update({ where: { token }, data: { used: true, usedAt: new Date() } }),
            prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
        ]);

        return { message: 'Password reset successful. You can now log in.' };
    }

    async registerLocal(payload, meta) {
        const email = payload.email.toLowerCase();
        const handle = payload.handle?.toLowerCase() || email.split('@')[0];
        const requestedRoleType = payload.roleType === 'ORG_ADMIN' ? 'ORG_ADMIN' : 'PENTESTER';

        const existingByEmail = await prisma.user.findUnique({ where: { email } });
        if (existingByEmail) {
            throw new AppError('Email already exists', 409, AuthErrorCodes.EMAIL_ALREADY_EXISTS);
        }

        const existingByHandle = await prisma.user.findUnique({ where: { handle } });
        if (existingByHandle) {
            throw new AppError('Handle already exists', 409, AuthErrorCodes.HANDLE_ALREADY_EXISTS);
        }

        const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
        const ensureRole = async (roleType) =>
            prisma.role.upsert({
                where: { type: roleType },
                update: {},
                create: {
                    name: roleType === 'ORG_ADMIN' ? 'Organization Admin' : 'Pentester',
                    type: roleType,
                    description:
                        roleType === 'ORG_ADMIN'
                            ? 'Full access within their organization'
                            : 'Default pentester role for new users',
                    permissions: [],
                },
            });

        const selectedRole = await ensureRole(requestedRoleType || 'PENTESTER');

        let user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName: payload.fullName,
                handle,
                provider: 'local',
                status: 'PENDING',
                isVerified: false,
                roles: selectedRole ? { connect: { id: selectedRole.id } } : undefined,
            },
            include: { roles: true },
        });

        const verification = await this.sendVerification(user, meta);

        return {
            user: this.sanitizeUser(user),
            message: verification.delivered
                ? 'Registration successful. Please check your email for the 6-digit verification code.'
                : 'Registration successful, but we could not send the verification code. Please request a new one or contact support.',
        };
    }

    async loginLocal(payload, meta) {
        const email = payload.email.toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true },
        });

        if (!user || !user.passwordHash) {
            throw new AppError('Invalid credentials', 401, AuthErrorCodes.INVALID_CREDENTIALS);
        }

        if (user.status === 'SUSPENDED') {
            throw new AppError('Account is suspended', 403, AuthErrorCodes.ACCOUNT_SUSPENDED);
        }

        if (user.status === 'BANNED') {
            throw new AppError('Account is banned', 403, AuthErrorCodes.ACCOUNT_BANNED);
        }

        if (!user.isVerified) {
            await this.sendVerification(user, meta);
            throw new AppError(
                'Please verify your email. We just sent you a new 6-digit code.',
                403,
                AuthErrorCodes.EMAIL_NOT_VERIFIED
            );
        }

        const isValid = await bcrypt.compare(payload.password, user.passwordHash);
        if (!isValid) {
            throw new AppError('Invalid credentials', 401, AuthErrorCodes.INVALID_CREDENTIALS);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        return this.issueTokens(user, meta);
    }

    async refresh(refreshToken, meta) {
        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400, AuthErrorCodes.REFRESH_TOKEN_INVALID);
        }

        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: { include: { roles: true } } },
        });

        if (!stored || stored.revoked) {
            throw new AppError('Invalid refresh token', 401, AuthErrorCodes.REFRESH_TOKEN_INVALID);
        }

        if (dayjs(stored.expiresAt).isBefore(dayjs())) {
            await prisma.refreshToken.update({
                where: { token: refreshToken },
                data: { revoked: true, revokedAt: new Date() },
            });
            throw new AppError('Refresh token expired', 401, AuthErrorCodes.REFRESH_TOKEN_EXPIRED);
        }

        const user = stored.user;
        if (!user) {
            throw new AppError('User not found', 404, AuthErrorCodes.USER_NOT_FOUND);
        }

        await prisma.refreshToken.update({
            where: { token: refreshToken },
            data: { revoked: true, revokedAt: new Date() },
        });

        return this.issueTokens(user, meta);
    }

    async logout(refreshToken) {
        if (!refreshToken) return;
        try {
            await prisma.refreshToken.update({
                where: { token: refreshToken },
                data: { revoked: true, revokedAt: new Date() },
            });
        } catch (error) {
            // Ignore if token is already revoked or not found
        }
    }

    async logoutAll(userId) {
        await prisma.refreshToken.deleteMany({ where: { userId } });
        return { message: 'Local session cleared. Please also log out from Auth0.' };
    }
}

export default new AuthService();
