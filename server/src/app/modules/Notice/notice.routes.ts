import { Router } from 'express';
import auth from '../../middleware/auth';
import {
  createNotice,
  deleteNotice,
  getAllNotices,
  notifyAll,
  publishOrUpdateNotice,
  sseStream,
} from './notice.controller';

const router = Router();

// public: everyone can read notices
router.get('/get-all-notices', getAllNotices);

// public: everyone can listen to alerts
router.get('/stream', sseStream);

// admin/superadmin: create/update/delete/notify
router.post('/create-notice', auth('admin', 'superadmin'), createNotice);
router.put('/publish-notice/:id', auth('admin', 'superadmin'), publishOrUpdateNotice);
router.delete('/delete-notice/:id', auth('admin', 'superadmin'), deleteNotice);
router.post('/notify-all/:id', auth('admin', 'superadmin'), notifyAll);

export default router;
