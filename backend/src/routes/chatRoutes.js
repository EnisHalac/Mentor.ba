import express from 'express';
import { startConversation,getConversations, sendMessage, searchUsers,getMessages } from '../controllers/chatController.js'; 
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/start", protect, startConversation);
router.post("/conversations", protect, getConversations);
router.post("/message", protect, sendMessage);
router.get("/search-users", protect, searchUsers);
router.get("/conversations/:conversationId/messages", protect, getMessages);

export default router;