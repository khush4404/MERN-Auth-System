import { userActivityController } from "../controller/activityController";
import { adminAuthMiddleware } from "../middleware/userMiddelware";

const express = require('express');

const router = express.Router();

router.get("/:id", adminAuthMiddleware, userActivityController);

export default router;