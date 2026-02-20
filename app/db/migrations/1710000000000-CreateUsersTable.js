class CreateUsersTable1710000000000 {
  async up(queryRunner) {
    // enable uuid generator
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('user', 'editor', 'member', 'admin');
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

        -- AUTH
        login VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,

        -- PROFILE
        "firstName" VARCHAR(100),
        "lastName" VARCHAR(100),
        email VARCHAR(200),
        phone VARCHAR(20),
        avatar VARCHAR(500),

        role user_role NOT NULL DEFAULT 'user',

        "pinnedPostId" UUID,

        "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP
      );
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT fk_users_pinned_post`);
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TYPE user_role`);
  }
}

module.exports = { CreateUsersTable1710000000000 };
