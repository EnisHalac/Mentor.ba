import { listListings, createListing } from "../services/listingsServices.js";

export async function getListings(req, res) {
  try {
    const listings = await listListings(req.query);
    return res.json({ ok: true, listings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "server error" });
  }
}

export async function postListing(req, res) {
  const {
    instructorId,
    title,
    description,
    category,
    pricePerHour,
    level,
    mode,
    location,
  } = req.body;

  if (!instructorId || !title || !description || !category || !pricePerHour || !level || !mode) {
    return res.status(400).json({
      ok: false,
      message: "nedostaju obavezna polja (instructorId, title, description, category, pricePerHour, level, mode)",
    });
  }

  try {
    const listing = await createListing({
      instructorId,
      title,
      description,
      category,
      pricePerHour,
      level,
      mode,
      location,
    });

    return res.status(201).json({ ok: true, listing });
  } catch (err) {
    if (err.message === "INSTRUCTOR_NOT_FOUND") {
      return res.status(404).json({ ok: false, message: "instruktor ne postoji" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, message: "server error" });
  }
}
