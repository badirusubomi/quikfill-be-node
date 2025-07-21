import { Client } from "pg";

const client = new Client({
	user: "postgres.dyzmlqjabmvuevgxxdvy",
	password: "gBYsrq3GuF!_&*2",
	host: "aws-0-ca-central-1.pooler.supabase.com",
	port: 6543,
	database: "postgres",
});

try {
	async () => await client.query("ROLLBACK");
} catch (e) {
	console.log(e);
	throw e;
}
