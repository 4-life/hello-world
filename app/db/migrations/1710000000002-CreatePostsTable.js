class CreatePostsTable1710000000002 {
  async up(queryRunner) {
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

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE posts DROP CONSTRAINT fk_posts_author`);
    await queryRunner.query(`DROP TABLE posts`);
  }
}

module.exports = { CreatePostsTable1710000000002 };
