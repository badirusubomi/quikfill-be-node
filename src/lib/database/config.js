import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Users } from "./entities/users.entities.js";
import path from "path";
import { UserUploads } from "./entities/user-uploads.entities.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const dbConfig = {
	type: "postgres",
	url: process.env["DATABASE_URL"],
	synchronize: false, //process.env?.["APP_ENV"] === "production" ? false : true,
	logging: process.env["ENVIRONMENT"] === "production" ? true : false,
	// entities: [join(__dirname, "src", "entities", "*.js")],
	entities: [Users, UserUploads],
	migrations: [path.join(__dirname, "./migrations/*.js")],
	// migrations: ["src/lib/database/migrations/*-migration.js"],
};

export default dbConfig;
