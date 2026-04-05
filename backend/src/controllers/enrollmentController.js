import {toggleEnrollmentService, getMyEnrollmentsService, getAuthorListingsWithStatsService, completeEnrollmentService, approveEnrollmentService, getListingEnrollmentsService} from "../services/enrollmentServices.js";

export const toggleEnrollment = async (req, res) => {
  try {
    const listingId = Number(req.params.listingId || req.params.id);
    const result = await toggleEnrollmentService(req.user.id, listingId);
    
    return res.status(200).json({ 
      ok: true, 
      message: "Status successfully updated.", 
      enrollment 
    });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Server error.";
    if (status === 500) console.error("Toggle Enrollment Error:", error);
    
    return res.status(status).json({ ok: false, message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await getMyEnrollmentsService(req.user.id);
    return res.status(200).json({ ok: true, enrollments });
  } catch (error) {
    console.error("Get Enrollments Error:", error);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
};

export const getAuthorListingsWithStats = async (req, res) => {
  try {
    const listings = await getAuthorListingsWithStatsService(req.user.id);
    return res.status(200).json({ ok: true, listings });
  } catch (error) {
    console.error("Get Author Stats Error:", error);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
};

export const completeEnrollment = async (req, res) => {
    try {
        const updated = await completeEnrollmentService(req.user.id, req.params.listingId);
        
        return res.status(200).json({ ok: true, message: "Enrollment marked as completed.", enrollment: updated });
    } catch (error) {
        const status = error.status || 500;
        const message = error.message || "Server error.";
        if (status === 500) console.error("Complete Enrollment Error:", error);
        
        return res.status(status).json({ ok: false, message });
    }
};

export const approveEnrollment = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const listingId = Number(req.params.listingId);
    const studentId = Number(req.params.studentId);

    const enrollment = await approveEnrollmentService(mentorId, listingId, studentId);
    res.status(200).json({ ok: true, message: "Prijava uspješno odobrena.", enrollment });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

export const getListingEnrollments = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const listingId = Number(req.params.listingId);

    const enrollments = await getListingEnrollmentsService(mentorId, listingId);
    res.status(200).json({ ok: true, enrollments });
  } catch (error) {
    res.status(403).json({ ok: false, message: error.message });
  }
};