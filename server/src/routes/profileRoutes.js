import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", asyncHandler(getProfile));
router.put("/", asyncHandler(updateProfile));

export default router;
