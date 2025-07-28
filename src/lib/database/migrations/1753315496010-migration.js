/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export default class Migration1753315496010 {
	name = "Migration1753315496010";

	async up(queryRunner) {
		await queryRunner.query(
			`CREATE TABLE "beta_users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, CONSTRAINT "UQ_c78548076f99cf0cf7a646b47b5" UNIQUE ("email"), CONSTRAINT "PK_e341aa930e08cf4cff3089efefb" PRIMARY KEY ("id"))`
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP TABLE "beta_users"`);
	}
}
