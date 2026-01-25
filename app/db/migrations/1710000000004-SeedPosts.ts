import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedPosts1710000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // find existing users
    const users = await queryRunner.query(`
      SELECT id, login FROM users ORDER BY login ASC;
    `);

    const user = users.find((u: any) => u.login === "user");
    const admin = users.find((u: any) => u.login === "admin");

    if (!user || !admin) {
      throw new Error("SeedUsers must be executed before SeedPosts");
    }

    await queryRunner.query(
      `
      INSERT INTO posts (id, title, content, "authorId", "createdDate")
      VALUES
        (uuid_generate_v4(), 'Hello World', 'First post by user', $1, now()),
        (uuid_generate_v4(), 'Admin Announcement', 'Important admin post', $2, now());
      `,
      [user.id, admin.id]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM posts WHERE title IN ('Hello World', 'Admin Announcement');
    `);
  }
}
