import express from 'express';
import * as controller from './user.controller.js';
import { protect, restrictTo } from '../../middleware/Auth.middleware.js';

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);

router.use(protect);

router.get('/me', controller.me);
router.patch('/update-profile', controller.updateProfile);
router.patch('/change-password', controller.changePassword);
router.post('/deactivate', controller.deactivate);
router.delete('/delete-account', controller.remove);

// Admin only route example
router.get('/', restrictTo('SUPER_ADMIN', 'ORG_ADMIN'), controller.listUsers);

export default router;
