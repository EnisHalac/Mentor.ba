import express from "express";
import { getRequests, approveMentor, rejectMentor, getStats } from "../controllers/adminController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/requests", protect, isAdmin, getRequests);
router.get("/stats", protect, isAdmin, getStats);
router.post("/approve/:id", protect, isAdmin, approveMentor);
router.post("/reject/:id", protect, isAdmin, rejectMentor);

export default router;