import { Router } from "express";
import { chat } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/", chat);

export default router;
