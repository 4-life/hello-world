import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostsTable1710000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create table
    await queryRunner.query(`
      CREATE TABLE posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR NOT NULL,
        content TEXT,
        "authorId" UUID NOT NULL,

        "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP
      );
    `);

    // FK to users
    await queryRunner.query(`
      ALTER TABLE posts
      ADD CONSTRAINT fk_posts_author
      FOREIGN KEY ("authorId") REFERENCES users(id)
      ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE posts DROP CONSTRAINT fk_posts_author`);
    await queryRunner.query(`DROP TABLE posts`);
  }
}
