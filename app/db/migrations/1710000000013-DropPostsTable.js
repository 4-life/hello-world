class DropPostsTable1710000000013 {
  async up(queryRunner) {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS "pinnedPostId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS posts`);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR NOT NULL,
        content VARCHAR,
        "authorId" UUID REFERENCES users(id)
      )
    `);
    await queryRunner.query(`ALTER TABLE users ADD COLUMN "pinnedPostId" UUID`);
  }
}

module.exports = { DropPostsTable1710000000013 };
