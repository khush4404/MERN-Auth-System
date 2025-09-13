import { verifyAuth, checkEmailExists, getUserDetail, registerController, loginController, forgotController, resetPasswordController, updateProfileController, deleteUserController, logoutController, userMessages } from "../controller/userController";
import { registerRouteMiddleware, verifyAuthMiddleware } from "../middleware/userMiddelware";

const express = require('express');

const router = express.Router();

router.post("/check-email", checkEmailExists);
router.post('/register', registerRouteMiddleware, registerController);
router.post('/login', loginController);
router.post('/forgot-password', forgotController);
router.post("/reset-password", verifyAuthMiddleware, resetPasswordController);
router.post("/update-profile", verifyAuthMiddleware, registerRouteMiddleware, updateProfileController);
router.put("/delete", verifyAuthMiddleware, deleteUserController);
router.get("/me", verifyAuthMiddleware, getUserDetail);
router.get("/auth/verify", verifyAuth);
router.post("/logout", verifyAuthMiddleware, logoutController);
router.get("/users-messages", verifyAuthMiddleware, userMessages);

export default router;