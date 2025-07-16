import { EntitySchema } from "typeorm";
import { Users } from "./users.entities.js";

export const UserUploads = new EntitySchema({
	name: "UserUploads",
	columns: {
		id: {
			type: Number,
			primary: true,
			generated: true,
		},
		createdAt: {
			type: Date,
		},
		file_name: {
			type: String,
		},
		file_category: {
			type: String,
		},
		description: {
			type: String,
		},
		upload_address_url: {
			type: String,
		},
		file_type: {
			type: String,
		},
		status: {
			type: String,
		},
	},
	relations: {
		user: {
			target: "Users",
			type: "many-to-one",
			joinColumn: {
				name: "user_email",
				referencedColumnName: "email",
			},
		},
	},
});
