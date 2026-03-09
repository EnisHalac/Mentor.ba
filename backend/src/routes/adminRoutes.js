import express from "express";
import { getRequests, approveMentor, rejectMentor, getStats, getListings, deleteListing } from "../controllers/adminController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/requests", protect, isAdmin, getRequests);
router.get("/stats", protect, isAdmin, getStats);
router.post("/approve/:id", protect, isAdmin, approveMentor);
router.post("/reject/:id", protect, isAdmin, rejectMentor);
router.get("/listings", protect, isAdmin, getListings);
router.delete("/listings/:id", protect, isAdmin, deleteListing);

export default router;