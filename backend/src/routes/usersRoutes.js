import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getUsers, postUser, putUser , getMyNotifications ,markNotificationsAsRead} from "../controllers/usersController.js";
import multer from "multer";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getUsers);
router.post("/", postUser);
router.put("/profile", protect ,upload.single("avatarFile"),putUser);
router.get("/notifications", protect, getMyNotifications);
router.put("/notifications/read", protect, markNotificationsAsRead);

export default router;
