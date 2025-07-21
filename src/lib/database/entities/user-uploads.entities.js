import { EntitySchema } from "typeorm";

export const UserUploads = new EntitySchema({
	name: "user_uploads",
	tableName: "user_uploads",
	columns: {
		id: {
			type: Number,
			primary: true,
			generated: true,
		},
		createdAt: {
			type: Date,
			default: () => "CURRENT_TIMESTAMP",
		},
		file_name: {
			type: String,
		},
		file_category: {
			type: String,
			nullable: true,
		},
		description: {
			type: String,
			nullable: true,
		},
		upload_address_url: {
			type: String,
			nullable: true,
		},
		upload_key: {
			type: String,
			nullable: true,
		},
		file_type: {
			type: String,
			nullable: true,
		},
		status: {
			type: String,
			nullable: true,
		},
	},
	relations: {
		user: {
			type: "many-to-one",
			target: "users",
			joinColumn: true,
			inverseSide: "user_uploads",
		},
	},
});
