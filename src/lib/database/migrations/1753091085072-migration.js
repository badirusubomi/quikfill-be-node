/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export default class Migration1753091085072 {
	name = "Migration1753091085072";

	async up(queryRunner) {
		await queryRunner.query(
			`CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "full_name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "auth_provider" character varying(100) NOT NULL, "id_token" text, "status" character varying(255) NOT NULL, "picture" text, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE TABLE "user_uploads" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "file_name" character varying NOT NULL, "file_category" character varying NOT NULL, "description" character varying NOT NULL, "upload_address_url" character varying NOT NULL, "file_type" character varying NOT NULL, "status" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_677f85e80602672b8b6d8c39e9c" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ADD CONSTRAINT "FK_0b4594df2e725bc03291a47c314" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "user_uploads" DROP CONSTRAINT "FK_0b4594df2e725bc03291a47c314"`
		);
		await queryRunner.query(`DROP TABLE "user_uploads"`);
		await queryRunner.query(`DROP TABLE "users"`);
	}
}
