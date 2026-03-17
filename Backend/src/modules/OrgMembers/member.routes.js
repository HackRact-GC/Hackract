import express from 'express';
import * as controller from './member.controller.js';
import { protect, restrictTo } from '../../middleware/Auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OrgMembers
 *   description: Organization member management APIs
 */

router.use(protect);
router.use(restrictTo('SUPER_ADMIN', 'ORG_ADMIN'));

/**
 * @swagger
 * /api/v1/members:
 *   post:
 *     summary: Add member to organization (ORG_ADMIN only)
 *     tags: [OrgMembers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - userId
 *             properties:
 *               organizationId:
 *                 type: string
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *               canCreatePentests:
 *                 type: boolean
 *               canInviteMembers:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', controller.add);

/**
 * @swagger
 * /api/v1/members/{organizationId}:
 *   get:
 *     summary: List members in an organization (ORG_ADMIN only)
 *     tags: [OrgMembers]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Members fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/:organizationId', controller.list);

/**
 * @swagger
 * /api/v1/members/{organizationId}/{userId}:
 *   get:
 *     summary: Get a specific organization member (ORG_ADMIN only)
 *     tags: [OrgMembers]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *   delete:
 *     summary: Remove member from organization (ORG_ADMIN only)
 *     tags: [OrgMembers]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: Member removed successfully
 *       404:
 *         description: Member not found
 *       401:
 *         description: Unauthorized
 *
 *   patch:
 *     summary: Update organization member (ORG_ADMIN only)
 *     tags: [OrgMembers]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               canCreatePentests:
 *                 type: boolean
 *               canInviteMembers:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       404:
 *         description: Member not found
 *       401:
 *         description: Unauthorized
 */
router.route('/:organizationId/:userId')
	.get(controller.get)
	.delete(controller.remove)
	.patch(controller.update);

export default router;
