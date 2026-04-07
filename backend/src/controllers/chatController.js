import * as chatService from '../services/chatServices.js';

export const startConversation = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const conversation = await chatService.findOrCreateConversation(req.user.id, targetUserId);
    res.status(200).json({ ok: true, conversation });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await chatService.getUserConversations(req.user.id);
    res.status(200).json({ ok: true, conversations });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await chatService.getMessagesByConversation(req.params.conversationId, req.user.id);
    res.status(200).json({ ok: true, messages });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const message = await chatService.createMessage(conversationId, req.user.id, content);
    res.status(201).json({ ok: true, message });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const users = await chatService.searchUsersByName(req.query.q, req.user.id);
    res.status(200).json({ ok: true, users });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
};