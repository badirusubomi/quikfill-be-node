import { EntitySchema } from "typeorm";

export const BetaUsers = new EntitySchema({
	name: "beta_users",
	tableName: "beta_users",
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
		email: {
			type: "varchar",
			length: 255,
			unique: true,
		},
	},
});
