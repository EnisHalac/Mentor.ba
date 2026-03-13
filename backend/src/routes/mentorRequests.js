import { Router } from "express";
import multer from "multer";
import { protect } from "../middlewares/authMiddleware.js";
import { submitMentorRequest } from "../controllers/mentorRequestController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/", protect, upload.array("proofFiles", 5), submitMentorRequest);

export default router;