class AddPinnedPostForeignKeyToUsers1710000000004 {
  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_pinned_post
      FOREIGN KEY ("pinnedPostId") REFERENCES posts(id)
      ON DELETE SET NULL;
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users
      DROP CONSTRAINT fk_users_pinned_post;
    `);
  }
}

module.exports = { AddPinnedPostForeignKeyToUsers1710000000004 };
