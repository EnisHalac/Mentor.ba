import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {prisma} from "./prisma.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, app: "Mentor.ba" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

app.get("/db-test", async (req, res) => {
    const userCount = await prisma.user.count();
    res.json({ ok : true ,userCount });
});
