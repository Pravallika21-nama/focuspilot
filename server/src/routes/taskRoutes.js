import { Router } from "express";
import { addTask, deleteTask, updateTask } from "../controllers/taskController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.post("/", asyncHandler(addTask));
router.patch("/:id", asyncHandler(updateTask));
router.delete("/:id", asyncHandler(deleteTask));

export default router;
