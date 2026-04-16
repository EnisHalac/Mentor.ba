import express from 'express';
import {protect} from "../middlewares/authMiddleware.js";
import {toggleEnrollment, getMyEnrollments, getAuthorListingsWithStats, completeEnrollment,approveEnrollment,getListingEnrollments,createReview,rejectEnrollment,getMentorReviews} from "../controllers/enrollmentController.js";

const router = express.Router();

router.get("/my-learning", protect, getMyEnrollments);
router.get("/author-stats", protect, getAuthorListingsWithStats);
router.get("/listing/:listingId", protect, getListingEnrollments);
router.post("/toggle/:listingId", protect, toggleEnrollment);
router.patch("/approve/:listingId/:studentId", protect, approveEnrollment);
router.patch("/complete/:listingId/:studentId", protect, completeEnrollment);
router.post("/review", protect, createReview);
router.delete("/reject/:listingId/:studentId", protect, rejectEnrollment);
router.get("/reviews/mentor", protect, getMentorReviews);

export default router;