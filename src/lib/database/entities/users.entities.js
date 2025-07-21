import { EntitySchema } from "typeorm";

export const Users = new EntitySchema({
	name: "users",
	tableName: "users",
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
			target: "user_uploads",
			inverseSide: "user",
		},
	},
});
