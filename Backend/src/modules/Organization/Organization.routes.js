import express from 'express';
import organizationController from './Organization.controller.js';
import * as organizationMiddleware from './Organization.middleware.js';

const router = express.Router();

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
router.post('/', organizationController.createOrganization);

/**
 * @swagger
 * /api/v1/organizations/me:
 *   get:
 *     summary: Get organizations of logged-in user
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: List of user organizations
 */
router.get('/me', organizationController.getMyOrganizations);

/**
 * @swagger
 * /api/v1/organizations/search:
 *   get:
 *     summary: Search organizations
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', organizationController.searchOrganizations);

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

router.post('/:organizationId/submit-verification',
  organizationMiddleware.isOrganizationOwner,
  organizationController.submitVerification
);

router.post('/:organizationId/validate-domain',
  organizationMiddleware.isOrganizationMember,
  organizationMiddleware.hasOrganizationPermission('manage_settings'),
  organizationController.validateDomain
);

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/members:
 *   get:
 *     summary: Get organization members
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of members
 *
 *   post:
 *     summary: Add member to organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@hackract.com
 *               role:
 *                 type: string
 *                 example: member
 *     responses:
 *       201:
 *         description: Member added
 */
router.route('/:organizationId/members')
  .get(
    organizationMiddleware.isOrganizationMember,
    organizationController.getMembers
  )
  .post(
    organizationMiddleware.hasOrganizationPermission('invite_members'),
    organizationController.addMember
  );

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/members/{memberId}:
 *   patch:
 *     summary: Update organization member
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *       - in: path
 *         name: memberId
 *         required: true
 *     responses:
 *       200:
 *         description: Member updated
 *
 *   delete:
 *     summary: Remove organization member
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *       - in: path
 *         name: memberId
 *         required: true
 *     responses:
 *       200:
 *         description: Member removed
 */
router.route('/:organizationId/members/:memberId')
  .patch(
    organizationMiddleware.hasOrganizationPermission('invite_members'),
    organizationController.updateMember
  )
  .delete(
    organizationMiddleware.hasOrganizationPermission('invite_members'),
    organizationController.removeMember
  );

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/leave:
 *   post:
 *     summary: Leave organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *     responses:
 *       200:
 *         description: Left organization successfully
 */
// router.post('/:organizationId/leave',
//   organizationMiddleware.isOrganizationMember,
//   organizationController.leaveOrganization
// );

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/transfer-ownership:
 *   post:
 *     summary: Transfer organization ownership
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newOwnerId
 *             properties:
 *               newOwnerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ownership transferred
 */
// router.post('/:organizationId/transfer-ownership',
//   organizationMiddleware.isOrganizationOwner,
//   organizationController.transferOwnership
// );

/**
 * @swagger
 * /api/v1/organizations/{organizationId}/stats:
 *   get:
 *     summary: Get organization statistics
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *     responses:
 *       200:
 *         description: Organization statistics
 */
// router.get('/:organizationId/stats',
//   organizationMiddleware.isOrganizationMember,
//   organizationController.getStatistics
// );

export default router;
