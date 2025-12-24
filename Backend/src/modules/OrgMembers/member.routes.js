import express from 'express';
import * as controller from './member.controller.js';
import { protect } from '../../middleware/Auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OrgMembers
 *   description: Organization member management APIs
 */

router.use(protect);

/**
 * @swagger
 * /api/v1/members:
 *   post:
 *     summary: Add member to organization
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
 *               - roleId
 *             properties:
 *               organizationId:
 *                 type: string
 *               userId:
 *                 type: string
 *               roleId:
 *                 type: string
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
 * /api/v1/members/{organizationId}/{userId}:
 *   delete:
 *     summary: Remove member from organization
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
 *     summary: Update organization member
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
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       404:
 *         description: Member not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:organizationId/:userId', controller.remove);
router.patch('/:organizationId/:userId', controller.update);

export default router;
