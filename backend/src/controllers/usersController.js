import { isValidEmail, isValidPassword } from "../utils/validators.js";
import { createUser, listUsers, updateUser } from "../services/usersServices.js";
import { prisma } from "../prisma.js";

export async function getUsers(req, res) {
  const users = await listUsers();
  return res.json({ ok: true, users });
}

export async function postUser(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email and password are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "Email is not valid" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ ok: false, message: "Password must have at least 6 characters" });
  }

  try {
    const user = await createUser({ email, password, name });
    return res.status(201).json({ ok: true, user });
  } catch (err) {
    if (err.message === "EMAIL_EXISTS") {
      return res.status(409).json({ ok: false, message: "Email is already registered" });
    }
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}

export async function putUser(req, res) {
  try {
    const updatedUser = await updateUser(req.user.id, req.body, req.file);
    return res.json({ ok: true, user: updatedUser });
  } catch (err) {
    if (err.message === "INVALID_OLD_PASSWORD") {
      return res.status(400).json({ ok: false, message: "Invalid old password" });
    }
    if (err.message === "IMAGE_UPLOAD_FAILED") {
      return res.status(500).json({ ok: false, message: "Image upload failed" });
    }
    return res.status(500).json({ ok: false, message: "Error occurred while updating profile" });
  }
}

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id, isRead: false }, 
      orderBy: { createdAt: "desc" }
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};