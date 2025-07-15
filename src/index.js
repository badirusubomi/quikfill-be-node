import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import generateRoutes from "./routes/generate.js";
import { verifyRefreshToken } from "./utils/jwt.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/generate", generateRoutes);

const authExceptRoutes = ["/login", "/signup"];

app.use((req, res, next) => {
	if (!authExceptRoutes.includes(req.baseUrl)) {
		let token = req.headers["Authorization"];
		try {
			let user = verifyRefreshToken(token);
			if (!user) {
				return res.status(401).json({ message: "User is unauthorized" });
			} else {
				next();
			}
		} catch (e) {
			console.log(e);
			return res.status(401).json({ message: "Invalid token" });
		}
	} else {
		next();
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
