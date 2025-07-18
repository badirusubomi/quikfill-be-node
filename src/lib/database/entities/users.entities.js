import { EntitySchema } from "typeorm";
import { UserUploads } from "./user-uploads.entities.js";

export const Users = new EntitySchema({
	name: "Users",
	tableName: "Users",
	columns: {
		id: {
			type: Number,
			primary: true,
			generated: true,
		},
		created_at: {
			type: "timestamp",
			default: () => "CURRENT_TIMESTAMP",
		},
		full_name: {
			type: "varchar",
			length: 255,
		},
		email: {
			type: "varchar",
			length: 255,
			unique: true,
		},
		auth_provider: {
			type: "varchar",
			length: 100,
		},
		id_token: {
			type: "text",
			nullable: true,
		},
		status: {
			type: "varchar",
			length: 255,
			nullable: false,
		},
		picture: {
			type: "text",
			nullable: true,
		},
	},
	relations: {
		user_uploads: {
			type: "one-to-many",
			target: "UserUploads",
			inverseSide: "user", // must match the relation name in UserUploads entity
			joinColumn: {
				name: "user_uploads",
			},
		},
	},
});
