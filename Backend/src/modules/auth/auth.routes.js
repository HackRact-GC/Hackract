import express from 'express';
import * as controller from './auth.controller.js';
import { protect, validateLocal } from '../../middleware/Auth.middleware.js';
import { requireOrganizationAdmin } from '../../middleware/rbac.middleware.js';
import {
	validate,
	registerSchema,
	loginSchema,
	refreshTokenSchema,
	verifyEmailSchema,
	validateOrgEmailSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	assignInitialRoleSchema,
} from './auth.schema.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and profile APIs (Auth0)
 */

/**
 * @swagger
 * /api/v1/auth/local/register:
 *   post:
 *     summary: Register with email/password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountType, fullName, email, password, confirmPassword]
 *             properties:
 *               accountType:
 *                 type: string
 *                 enum: [HACKER, ORGANIZATION]
 *               fullName:
 *                 type: string
 *               handle:
 *                 type: string
 *                 description: Optional unique handle/username
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               organization:
 *                 type: object
 *                 description: Required when accountType=ORGANIZATION
 *                 properties:
 *                   name:
 *                     type: string
 *                   website:
 *                     type: string
 *                   industry:
 *                     type: string
 *                   size:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *     responses:
 *       201:
 *         description: Registration successful (returns tokens + verification requirement)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                     requiresEmailVerification:
 *                       type: boolean
 */
router.post('/local/register', validate(registerSchema), controller.registerLocal);

/**
 * @swagger
 * /api/v1/auth/local/login:
 *   post:
 *     summary: Login with email/password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful (returns access + refresh token)
 */
router.post('/local/login', validate(loginSchema), controller.loginLocal);

/**
 * @swagger
 * /api/v1/auth/validate-org-email:
 *   post:
 *     summary: Validate organization email domain (rejects public domains like gmail)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validation result
 */
router.post('/validate-org-email', validate(validateOrgEmailSchema), controller.validateOrgEmail);

/**
 * @swagger
 * /api/v1/auth/local/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post('/local/refresh', validate(refreshTokenSchema), controller.refreshToken);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Verify email with 6-digit code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit verification code
 *               email:
 *                 type: string
 *                 description: Optional (legacy). Verification can be completed with token only.
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or missing token
 *       410:
 *         description: Token expired
 */
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);

<<<<<<< HEAD
=======
/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Send password reset link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent (if account exists)
 */
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token
 *       410:
 *         description: Token expired
 */
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);

>>>>>>> origin/main
/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, controller.getMe);

/**
 * @swagger
 * /api/v1/auth/assign-initial-role:
 *   post:
 *     summary: Assign initial role after social login (Hacker only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [PENTESTER]
 *     responses:
 *       200:
 *         description: Role assigned successfully
 */
router.post('/assign-initial-role', protect, validate(assignInitialRoleSchema), controller.assignInitialRole);

// Local JWT-protected profile
router.get('/local/me', validateLocal, controller.getMe);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout (local session)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', controller.logout);

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: Logout from all devices (clear local tokens)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 */
router.post('/logout-all', protect, controller.logoutAll);

// Admin lookup by email (supports both token types)

/**
 * @swagger
 * /api/v1/auth/user-by-email:
 *   get:
 *     summary: Lookup a user by email (org admin/system admin)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Used to validate that the caller is an admin of this organization
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
	'/user-by-email',
	protect,
	requireOrganizationAdmin({ organizationIdField: 'organizationId' }),
	controller.findUserByEmail
);

export default router;
