import express from 'express';
import * as controller from './legalAgreement.controller.js';
import { protect, restrictTo } from '../../middleware/Auth.middleware.js';

const router = express.Router();

// Public route to get active agreements
router.get('/active/:type', controller.getActiveByType);

router.use(protect);

// Admin routes
router.post('/', restrictTo('SUPER_ADMIN'), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.get);
router.patch('/:id', restrictTo('SUPER_ADMIN'), controller.update);
router.delete('/:id', restrictTo('SUPER_ADMIN'), controller.remove);

export default router;
