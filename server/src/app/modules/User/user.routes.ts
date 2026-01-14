import { Router } from 'express';
import clientInfoParser from '../../middleware/clientInfoParser';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import { UserRole } from './user.utils';

const router = Router();

// router.get('/', Auth(UserRole.ADMIN), UserController.getAllUser);
//
// router.get('/me', Auth(UserRole.ADMIN, UserRole.USER), UserController.myProfile);

router.post('/', clientInfoParser, UserController.registerUser);

router.post('/verfy-email', UserController.verifyEmail);
// Update admin profile
router.patch(
	'/admin/:id',
	auth(UserRole.ADMIN),
	multerUpload.single('profileImage'),
	parseBody,
	validateRequest(UserValidation.adminProfileValidationSchema),
	UserController.updateAdminProfile
);

// Update student profile
router.patch(
	'/student/:id',
	auth(UserRole.STUDENT),
	multerUpload.single('profileImage'),
	parseBody,
	validateRequest(UserValidation.studentProfileValidationSchema),
	UserController.updateStudentProfile
);

// Update driver profile
router.patch(
	'/driver/:id',
	auth(UserRole.DRIVER),
	multerUpload.single('profileImage'),
	parseBody,
	validateRequest(UserValidation.driverProfileValidationSchema),
	UserController.updateDriverProfile
);
//
// router.patch(
//   '/:id/status',
//   Auth(UserRole.ADMIN),
//   UserController.updateUserStatus
// );

export const UserRoutes = router;
