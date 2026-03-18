import express from 'express';
import { protect, restrictTo } from '../../middleware/Auth.middleware.js';
import { validate } from '../auth/auth.schema.js';
import { upsertHackerProfileSchema } from './hackerProfile.schema.js';
import * as controller from './hackerProfile.controller.js';

const router = express.Router();

// All hacker profile routes require authentication
router.use(protect);

// Hacker self-service routes (PENTESTER role)
router.get('/me', restrictTo('PENTESTER'), controller.getMe);
router.get('/me/status', restrictTo('PENTESTER'), controller.getStatus);
router.put('/me', restrictTo('PENTESTER'), validate(upsertHackerProfileSchema), controller.upsertMe);
router.post('/me/submit', restrictTo('PENTESTER'), controller.submitMe);
router.post('/me/sign-agreement', restrictTo('PENTESTER'), controller.signAgreement);

// Admin review routes
router.get('/', restrictTo('SUPER_ADMIN', 'ORG_ADMIN'), controller.listForReview);
router.post('/:id/approve', restrictTo('SUPER_ADMIN', 'ORG_ADMIN'), controller.approve);
router.post('/:id/reject', restrictTo('SUPER_ADMIN', 'ORG_ADMIN'), controller.reject);

export default router;

