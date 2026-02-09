import { isValidEmail, isValidPassword } from "../utils/validators.js";
import { createUser, listUsers } from "../services/usersServices.js";

export async function getUsers(req, res) {
  const users = await listUsers();
  return res.json({ ok: true, users });
}

export async function postUser(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "email i password su obavezni" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "email mora biti validan (mora sadrzavati @)" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ ok: false, message: "password mora imati min 6 karaktera" });
  }

  try {
    const user = await createUser({ email, password, name });
    return res.status(201).json({ ok: true, user });
  } catch (err) {
    if (err.message === "EMAIL_EXISTS") {
      return res.status(409).json({ ok: false, message: "email je vec registrovan" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, message: "server error" });
  }
}
