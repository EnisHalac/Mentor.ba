import express from "express";
import { protect,isAdmin } from "../middlewares/authMiddleware.js"; // Tvoj middleware za auth

import * as ticketController from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", protect, ticketController.createNewTicket);
router.get("/my-tickets", protect, ticketController.getMyTickets);
router.get("/:id", protect, ticketController.getSingleTicket);
router.post("/:id/messages", protect, ticketController.replyToTicket);
router.get("/admin/all", protect, isAdmin, ticketController.getAllTickets);
router.put("/admin/:id/status", protect, isAdmin, ticketController.changeStatus);

export default router;