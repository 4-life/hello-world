const bcrypt = require('bcrypt');

class SeedUsers1710000000001 {
  async up(queryRunner) {
    const userPassword = await bcrypt.hash('user', 10);
    const adminPassword = await bcrypt.hash('admin', 10);

    await queryRunner.query(
      `
      INSERT INTO users (id, login, password, "firstName", "lastName", email, role, "createdDate")
      VALUES
        (uuid_generate_v4(), 'user', $1, 'John', 'Doe', 'user@example.com', 'user', now()),
        (uuid_generate_v4(), 'admin', $2, 'Admin', 'Boss', 'admin@example.com', 'admin', now());
      `,
      [userPassword, adminPassword]
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`
      DELETE FROM users WHERE login IN ('user', 'admin');
    `);
  }
}

module.exports = { SeedUsers1710000000001 };
