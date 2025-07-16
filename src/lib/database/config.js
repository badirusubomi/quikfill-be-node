import dotenv from "dotenv";
import { Users } from "./entities/users.entities.js";
import { UserUploads } from "./entities/user-uploads.entities.js";

dotenv.config();

const dbConfig = {
	type: "postgres",
	url: process.env["DATABASE_URL"],
	synchronize: process.env?.["APP_ENV"] === "production" ? true : false,
	logging: false,
	entities: [Users, UserUploads],
};

export default dbConfig;
