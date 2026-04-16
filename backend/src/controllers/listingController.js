import * as listingService from "../services/listingServices.js";

export const getAllListings = async (req, res) => {
  try {
    const listings = await listingService.fetchAllListings();
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createListing = async (req, res) => {
  try {
    const listing = await listingService.createNewListing(req.body, req.user.id);
    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    await listingService.deleteListingById(req.params.id, req.user.id, req.user.role.name);
    res.json({ message: "Listing deleted successfully." });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (isNaN(listingId)) {
      return res.status(400).json({ message: "Invalid listing ID." });
    }
    const listing = await listingService.getListingByIdService(listingId);
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    res.json(listing);

  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ message: "Server error." });
  }
};