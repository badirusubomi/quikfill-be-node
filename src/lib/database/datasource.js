import { DataSource } from "typeorm";
import dbConfig from "./config.js";

// const dbConfig = require("./config");
// import { dbConfig } from "./config";

const AppDataSource = new DataSource(dbConfig);

export default AppDataSource;
