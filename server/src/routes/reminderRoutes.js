import { Router } from "express";
import { body } from "express-validator";
import { getReminderPrefs, updateReminderPrefs } from "../controllers/reminderController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/preferences", asyncHandler(getReminderPrefs));

router.put(
  "/preferences",
  [
    body("emailEnabled").isBoolean().withMessage("emailEnabled must be a boolean"),
    body("reminderTime")
      .optional()
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("reminderTime must be in HH:MM format"),
    body("studyDays")
      .optional()
      .isArray()
      .withMessage("studyDays must be an array of day numbers (0=Sun, 6=Sat)"),
  ],
  asyncHandler(updateReminderPrefs)
);

export default router;
