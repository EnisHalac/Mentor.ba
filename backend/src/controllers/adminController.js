import * as adminService from "../services/adminServices.js";

export const getRequests = async (req, res) => {
  try {
    const data = await adminService.getAllPendingRequests();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveMentor = async (req, res) => {
  try {
    await adminService.processApproval(req.params.id);
    res.json({ ok: true, message: "Korisnik je postao mentor!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectMentor = async (req, res) => {
  try {
    const { reason } = req.body;
    await adminService.processRejection(req.params.id, reason);
    res.json({ ok: true, message: "Zahtjev odbijen." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await adminService.getSystemStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};