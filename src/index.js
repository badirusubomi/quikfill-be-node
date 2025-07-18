import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "reflect-metadata";
import authRoutes from "./routes/auth.js";
import queryRoutes from "./routes/query.js";
import uploadRoutes from "./routes/upload.js";
import generateRoutes from "./routes/generate.js";
import { verifyRefreshToken } from "./utils/jwt.js";
import AppDataSource from "./lib/database/datasource.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/generate", generateRoutes);
app.use("/upload", uploadRoutes);
app.use("/query", queryRoutes);

const authMiddlewareExceptRoutes = ["auth"];

app.use((req, res, next) => {
	if (!authMiddlewareExceptRoutes.filter((url) => req.url.includes(url))) {
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

AppDataSource.initialize()
	.then(() => {
		console.log("Data Source has been initialized!");
	})
	.catch((err) => {
		console.error("Error during Data Source initialization", err);
	});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
