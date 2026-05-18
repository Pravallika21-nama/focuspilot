import { Router } from "express";
import { chat } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.use(protect);
router.post("/", asyncHandler(chat));

export default router;
