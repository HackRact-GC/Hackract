import express from 'express';
import * as controller from './userSignature.controller.js';
import { protect, restrictTo } from '../../middleware/Auth.middleware.js';

const router = express.Router();

router.use(protect);

// User routes
router.post('/sign', controller.sign);
router.get('/my-signatures', controller.getMySignatures);
router.get('/check/:agreementId', controller.checkSigned);

// Admin routes
router.get('/agreement/:agreementId', restrictTo('SUPER_ADMIN', 'ORG_ADMIN'), controller.getSignaturesByAgreement);
router.get('/:id', restrictTo('SUPER_ADMIN', 'ORG_ADMIN'), controller.get);

export default router;
