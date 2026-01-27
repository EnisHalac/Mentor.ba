import { Router } from "express";
import { getListings, postListing } from "../controllers/listingsController.js";

const router = Router();

router.get("/", getListings);
router.post("/", postListing);

export default router;
