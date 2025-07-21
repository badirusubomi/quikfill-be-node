/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export default class Migration1753092805135 {
	name = "Migration1753092805135";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ADD "upload_key" character varying`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "file_category" DROP NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "description" DROP NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "upload_address_url" DROP NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "file_type" DROP NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "status" DROP NOT NULL`
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "status" SET NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "file_type" SET NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "upload_address_url" SET NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "description" SET NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" ALTER COLUMN "file_category" SET NOT NULL`
		);
		await queryRunner.query(
			`ALTER TABLE "user_uploads" DROP COLUMN "upload_key"`
		);
	}
}
