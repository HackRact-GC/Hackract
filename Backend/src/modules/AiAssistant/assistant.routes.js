import express from 'express';
import * as controller from './assistant.controller.js';
import { protect, restrictTo } from '../../middleware/Auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('SUPER_ADMIN')); // Managing assistants is admin only

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.get);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
