import express from "express";
import auth from "../../middleware/auth";
import { AuthController } from "./auth.controller";
import { UserRole } from "../User/user.utils";

const router = express.Router();

// auth
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshToken);

router.post("/change-password", auth(UserRole.STUDENT, UserRole.DRIVER, UserRole.ADMIN, UserRole.SUPERADMIN), AuthController.changePassword);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

// admin dashboard approvals
router.get(
  "/get-pending-registrations",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  AuthController.getPendingRegistrations
);

router.post(
  "/approve-registration/:id",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  AuthController.approveRegistration
);

router.delete(
  "/reject-registration/:id",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  AuthController.rejectRegistration
);

export const AuthRoutes = router;
