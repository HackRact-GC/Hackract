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
 * /api/v1/organization:
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

/**
 * @swagger
 * /api/v1/organizations:
 *   get:
 *     summary: List organizations
 *     description: SUPER_ADMIN can list all organizations; other roles list organizations they are members of.
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by organization name (contains)
 *       - in: query
 *         name: ownerName
 *         schema:
 *           type: string
 *         description: Filter by owner name/handle/email (contains). SUPER_ADMIN only.
 *     responses:
 *       200:
 *         description: Organizations retrieved successfully
 *       401:
 *         description: Unauthorized
 */
// List organizations (SUPER_ADMIN => all; others => memberships)
router.get('/', restrictTo('SUPER_ADMIN', 'ORG_ADMIN', 'PENTESTER'), organizationController.listOrganizations);

/**
 * @swagger
 * /api/v1/organizations/by-name:
 *   get:
 *     summary: Get organizations by name
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization name (contains)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Organizations retrieved successfully
 *       400:
 *         description: Validation error
 */
/**
 * @swagger
 * /api/v1/organizations/by-owner:
 *   get:
 *     summary: Get organizations by owner name
 *     description: SUPER_ADMIN only.
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: ownerName
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner full name, handle, or email (contains)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Organizations retrieved successfully
 *       403:
 *         description: Forbidden
 */
// Search / filter helpers
router.get('/by-name', restrictTo('SUPER_ADMIN', 'ORG_ADMIN', 'PENTESTER'), organizationController.getOrganizationsByName);
router.get('/by-owner', restrictTo('SUPER_ADMIN'), organizationController.getOrganizationsByOwnerName);

/**
 * @swagger
 * /api/v1/organizations:
 *   delete:
 *     summary: Delete all organizations
 *     description: DANGEROUS. SUPER_ADMIN only.
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: All organizations deleted successfully
 *       403:
 *         description: Forbidden
 */
// Delete all organizations (DANGEROUS) - SUPER_ADMIN only
router.delete('/', restrictTo('SUPER_ADMIN'), organizationController.deleteAllOrganizations);

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
