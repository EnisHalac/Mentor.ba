import {
  toggleEnrollmentService,
  getMyEnrollmentsService,
  getAuthorListingsWithStatsService,
  completeEnrollmentService,
  approveEnrollmentService,
  getListingEnrollmentsService
} from "../services/enrollmentServices.js";

export const toggleEnrollment = async (req, res) => {
  try {
    const listingId = Number(req.params.listingId || req.params.id);
    const result = await toggleEnrollmentService(req.user.id, listingId);
    return res.status(200).json({ ok: true, message: "Status successfully updated.", enrollment: result });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ ok: false, message: error.message || "Server error." });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await getMyEnrollmentsService(req.user.id);
    return res.status(200).json({ ok: true, enrollments });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Server error." });
  }
};

export const getAuthorListingsWithStats = async (req, res) => {
  try {
    const listings = await getAuthorListingsWithStatsService(req.user.id);
    return res.status(200).json({ ok: true, listings });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Server error." });
  }
};

export const completeEnrollment = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const listingId = Number(req.params.listingId);
    const studentId = Number(req.params.studentId);

    const updated = await completeEnrollmentService(mentorId, studentId, listingId);
    return res.status(200).json({ ok: true, message: "Instrukcije označene kao završene.", enrollment: updated });
  } catch (error) {
    const status = error.message.includes("dozvolu") ? 403 : 400;
    return res.status(status).json({ ok: false, message: error.message });
  }
};

export const approveEnrollment = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const listingId = Number(req.params.listingId);
    const studentId = Number(req.params.studentId);

    const enrollment = await approveEnrollmentService(mentorId, listingId, studentId);
    return res.status(200).json({ ok: true, message: "Prijava uspješno odobrena.", enrollment });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
};

export const getListingEnrollments = async (req, res) => {
  try {
    const enrollments = await getListingEnrollmentsService(req.user.id, Number(req.params.listingId));
    return res.status(200).json({ ok: true, enrollments });
  } catch (error) {
    return res.status(403).json({ ok: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { enrollmentId, rating, comment } = req.body;
    const review = await createReviewService(req.user.id, enrollmentId, rating, comment);
    res.status(201).json({ ok: true, review });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};