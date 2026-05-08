class UpdateUserRoleEnum1710000000008 {
  async up(queryRunner) {
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role DROP DEFAULT`);
    await queryRunner.query(`ALTER TYPE user_role RENAME TO user_role_old`);
    await queryRunner.query(`CREATE TYPE user_role AS ENUM ('user', 'manager', 'admin')`);
    await queryRunner.query(`
      ALTER TABLE users
        ALTER COLUMN role TYPE user_role
        USING (CASE role::text
          WHEN 'member' THEN 'user'
          WHEN 'editor' THEN 'manager'
          ELSE role::text
        END)::user_role
    `);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'`);
    await queryRunner.query(`DROP TYPE user_role_old`);
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TYPE user_role RENAME TO user_role_old`);
    await queryRunner.query(`CREATE TYPE user_role AS ENUM ('user', 'editor', 'member', 'admin')`);
    await queryRunner.query(`
      ALTER TABLE users
        ALTER COLUMN role TYPE user_role
        USING role::text::user_role
    `);
    await queryRunner.query(`DROP TYPE user_role_old`);
  }
}

module.exports = { UpdateUserRoleEnum1710000000008 };
