import { DataSource } from "typeorm";
import dbConfig from "./config.js";

const AppDataSource = new DataSource(dbConfig);

export default AppDataSource;
