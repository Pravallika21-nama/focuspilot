import { Router } from "express";
import { createNotification, listNotifications, sendTestEmail } from "../controllers/notificationController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", asyncHandler(listNotifications));
router.post("/", asyncHandler(createNotification));
router.post("/test-email", asyncHandler(sendTestEmail));

export default router;
