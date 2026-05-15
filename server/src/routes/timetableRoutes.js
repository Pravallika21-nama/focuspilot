import { Router } from "express";
import { createTimetable, getActiveTimetable, listTimetables } from "../controllers/timetableController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", asyncHandler(listTimetables));
router.get("/active", asyncHandler(getActiveTimetable));
router.post("/generate", asyncHandler(createTimetable));

export default router;
