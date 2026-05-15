import { Router } from "express";
import { getAnalytics } from "../controllers/progressController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/analytics", asyncHandler(getAnalytics));

export default router;
