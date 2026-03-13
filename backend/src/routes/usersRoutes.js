import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getUsers, postUser, putUser } from "../controllers/usersController.js";
import multer from "multer";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getUsers);
router.post("/", postUser);
router.put("/profile", protect ,upload.single("avatarFile"),putUser);

export default router;
