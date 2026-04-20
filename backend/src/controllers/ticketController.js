import * as ticketService from "../services/ticektServices.js";

export const createNewTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const ticket = await ticketService.createTicket(req.user.id, subject, description);
    res.status(201).json({ ok: true, ticket });
  } catch (error) {
    res.status(500).json({ message: "Greška pri kreiranju tiketa." });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getUserTickets(req.user.id);
    res.json({ ok: true, tickets });
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatanju tiketa." });
  }
};

export const getSingleTicket = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketDetails(req.params.id, req.user.id, req.user.role.name || req.user.role);
    res.json({ ok: true, ticket });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const replyToTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await ticketService.addMessage(req.params.id, req.user.id, message);
    res.json({ ok: true, reply });
  } catch (error) {
    res.status(500).json({ message: "Greška pri slanju poruke." });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTicketsAdmin();
    res.json({ ok: true, tickets });
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvatanju tiketa." });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const updated = await ticketService.updateTicketStatus(req.params.id, req.body.status);
    res.json({ ok: true, ticket: updated });
  } catch (error) {
    res.status(500).json({ message: "Greška pri ažuriranju statusa." });
  }
};