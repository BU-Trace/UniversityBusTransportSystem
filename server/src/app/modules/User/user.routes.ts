// Update driver status (active/inactive or custom status)

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
router.patch(
  '/driver/:id/status',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  UserController.updateDriverStatus
);
router.post('/', clientInfoParser, UserController.registerUser);

// Verify email
router.post('/verify-email', UserController.verifyEmail);

// Get all users
router.get('/get-all-users', auth(UserRole.ADMIN, UserRole.SUPERADMIN), UserController.getAllUsers);

// Get all drivers
router.get(
  '/get-all-drivers',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  UserController.getAllDrivers
);

// Get all students
router.get(
  '/get-all-students',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  UserController.getAllStudents
);

// Admin adds a driver (dedicated)
router.post(
  '/add-driver',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  validateRequest(UserValidation.adminCreateDriverSchema),
  UserController.adminCreateDriver
);

// Admin adds a user (dashboard add)
router.post(
  '/add-user',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  validateRequest(UserValidation.adminCreateUserSchema),
  UserController.adminCreateUser
);

// Admin updates a user (dashboard edit)
router.put(
  '/update-user/:id',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  validateRequest(UserValidation.adminUpdateUserSchema),
  UserController.adminUpdateUser
);


// Admin deletes a user
router.delete(
  '/delete-user/:id',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  UserController.adminDeleteUser
);

// Update admin profile
router.patch(
  '/admin/:id',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
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

export const UserRoutes = router;
