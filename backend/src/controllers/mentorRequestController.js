import { createMentorRequest } from "../services/mentorRequestServices.js";

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export async function submitMentorRequest(req, res) {
  try {
    const { subject, experience, linkedinUrl, githubUrl } = req.body;

    if (!subject || !experience) {
      return res.status(400).json({ ok: false, message: "Field and Experience are required." });
    }

    if (linkedinUrl && !isValidUrl(linkedinUrl)) {
      return res.status(400).json({ ok: false, message: "LinkedIn URL is not a valid format." });
    }
    if (githubUrl && !isValidUrl(githubUrl)) {
      return res.status(400).json({ ok: false, message: "GitHub URL is not a valid format." });
    }

    const request = await createMentorRequest(req.user.id, req.body, req.files);
    
    return res.status(201).json({ 
      ok: true, 
      message: "Request submitted successfully. Awaiting admin approval.",
      request 
    });

  } catch (err) {
    console.error("Mentor Request Error:", err);
    
    if (err.message === "ALREADY_PENDING") {
      return res.status(409).json({ ok: false, message: "You already have a request pending approval." });
    }
    if (err.message === "UPLOAD_FAILED") {
      return res.status(500).json({ ok: false, message: "Error occurred while uploading documents." });
    }
    
    return res.status(500).json({ ok: false, message: "An error occurred on the server." });
  }
}