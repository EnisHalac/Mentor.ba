import { isValidEmail, isValidPassword } from "../utils/validators.js";
import { createUser, listUsers , updateUser} from "../services/usersServices.js";

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
    console.error(err);
    return res.status(500).json({ ok: false, message: "server error" });
  }
}

export async function putUser(req, res) {
  try {
    const updatedUser = await updateUser(req.user.id, req.body);
    return res.json({ ok: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error occurred while updating profile" });
  }
}