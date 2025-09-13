import { allUsers, deleteAdminController, editAdminController, getAdminUserDetail } from "../controller/adminController";
import { registerController } from "../controller/userController";
import { adminAuthMiddleware, registerRouteMiddleware } from "../middleware/userMiddelware";

const express = require('express');

const router = express.Router();

router.get("/users", adminAuthMiddleware, allUsers);
router.put("/user/delete/:id", adminAuthMiddleware, deleteAdminController);
router.get("/user/:id", adminAuthMiddleware, getAdminUserDetail);
router.put("/user/edit/:id", adminAuthMiddleware, registerRouteMiddleware, editAdminController);
router.post("/user/create", adminAuthMiddleware, registerRouteMiddleware, registerController);

export default router;