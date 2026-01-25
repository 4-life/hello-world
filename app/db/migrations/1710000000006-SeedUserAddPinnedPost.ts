import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedPinnedPostForFirstUser1710000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // get the earliest user
    const [firstUser] = await queryRunner.query(`
      SELECT id 
      FROM users
      ORDER BY "createdDate" ASC 
      LIMIT 1;
    `);

    if (!firstUser) {
      console.warn("No users found, skipping pinned post seed.");
      return;
    }

    const [firstPost] = await queryRunner.query(`
      SELECT id 
      FROM posts
      ORDER BY "createdDate" ASC 
      LIMIT 1;
    `);

    if (!firstPost) {
      console.warn("No posts found, skipping pinned post seed.");
      return;
    }

    // set pinned post
    await queryRunner.query(
      `
      UPDATE users
      SET "pinnedPostId" = $1
      WHERE id = $2;
      `,
      [firstPost.id, firstUser.id]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [firstUser] = await queryRunner.query(`
      SELECT id 
      FROM users
      ORDER BY "createdDate" ASC 
      LIMIT 1;
    `);

    if (!firstUser) return;

    await queryRunner.query(
      `
      UPDATE users
      SET "pinnedPostId" = NULL
      WHERE id = $1;
      `,
      [firstUser.id]
    );
  }
}
