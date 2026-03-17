import express from 'express';
import organizationController from './Organization.controller.js';
import * as organizationMiddleware from './Organization.middleware.js';
import { protect, restrictTo } from '../../middleware/Auth.middleware.js';

const router = express.Router();

// Apply global authentication to all organization routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management APIs
 */

/**
 * @swagger
 * /api/v1/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: HackRact Security
 *               slug:
 *                 type: string
 *                 example: hackract-security
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', restrictTo('SUPER_ADMIN', 'ORG_ADMIN', 'PENTESTER'), organizationController.createOrganization);

// my-organizations endpoint removed

/**
 * @swagger
 * /api/v1/organizations/{organizationId}:
 *   get:
 *     summary: Get organization details
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization details
 *       404:
 *         description: Organization not found
 *
 *   patch:
 *     summary: Update organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization updated
 *
 *   delete:
 *     summary: Delete organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization deleted
 */
router.route('/:organizationId')
  .get(
    organizationMiddleware.isOrganizationMember,
    organizationController.getOrganization
  )
  .patch(
    organizationMiddleware.isOrganizationMember,
    organizationMiddleware.hasOrganizationPermission('manage_settings'),
    organizationController.updateOrganization
  )
  .delete(
    organizationMiddleware.isOrganizationOwner,
    organizationController.deleteOrganization
  );

export default router;
