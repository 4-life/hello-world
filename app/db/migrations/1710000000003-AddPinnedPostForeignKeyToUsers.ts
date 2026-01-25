import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPinnedPostForeignKeyToUsers1710000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_pinned_post
      FOREIGN KEY ("pinnedPostId") REFERENCES posts(id)
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP CONSTRAINT fk_users_pinned_post;
    `);
  }
}
