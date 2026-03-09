import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getUsers, postUser, putUser } from "../controllers/usersController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.put("/Profile", protect ,putUser);

export default router;
