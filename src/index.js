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
import aws from "aws-sdk";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

AppDataSource.initialize()
	.then(() => {
		console.log("Data Source has been initialized!");
	})
	.catch((err) => {
		console.error("Error during Data Source initialization", err);
	});

const authMiddlewareExceptRoutes = ["/auth"];

app.use(async (req, res, next) => {
	if (
		authMiddlewareExceptRoutes.filter((url) => req.originalUrl.includes(url))
			.length === 0
	) {
		let token = await req.headers.authorization?.split(" ")[1];
		try {
			let user = await verifyRefreshToken(token);
			if (!user) {
				return res.status(401).json({ message: "User is unauthorized" });
			} else {
				const userRepository = AppDataSource.getRepository("users");
				const dbUser = await userRepository.findOne({
					where: { email: user["email"] },
				});
				req.user = dbUser;
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

app.use("/auth", authRoutes);
app.use("/generate", generateRoutes);
app.use("/upload", uploadRoutes);
app.use("/query", queryRoutes);

aws.config.update({
	secretAccessKey: process.env.AWS_SECRET_KEY,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	region: process.env.S3_REGION,
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
