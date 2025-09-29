import { Router } from 'express';
import clientInfoParser from '../../middleware/clientInfoParser';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { UserRole } from './user.interface';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';

const router = Router();

// router.get('/', Auth(UserRole.ADMIN), UserController.getAllUser);
//
// router.get('/me', Auth(UserRole.ADMIN, UserRole.USER), UserController.myProfile);

router.post(
  '/',
  clientInfoParser,
  validateRequest(UserValidation.userValidationSchema),
  UserController.registerUser
);
// // update profile
// router.patch(
//   '/update-profile',
//   Auth(UserRole.USER),
//   multerUpload.single('profilePhoto'),
//   parseBody,
//   validateRequest(UserValidation.customerInfoValidationSchema),
//   UserController.updateProfile
// );
//
// router.patch(
//   '/:id/status',
//   Auth(UserRole.ADMIN),
//   UserController.updateUserStatus
// );

export const UserRoutes = router;
