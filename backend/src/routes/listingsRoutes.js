import express from "express";
import { getAllListings, createListing,deleteListing, getListingById} from "../controllers/listingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllListings);
router.get("/:id", getListingById);
router.post("/", protect, createListing);
router.delete("/:id", protect, deleteListing);

export default router;