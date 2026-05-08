const bcrypt = require('bcrypt');

class SeedAdminAndManager1710000000014 {
  async up(queryRunner) {
    const adminPassword = await bcrypt.hash('admin', 10);
    const managerPassword = await bcrypt.hash('manager', 10);

    await queryRunner.query(
      `
      INSERT INTO users (id, login, password, email, role, "createdDate")
      VALUES
        (uuid_generate_v4(), 'admin', $1, 'admin@example.com', 'admin', now()),
        (uuid_generate_v4(), 'manager', $2, 'manager@example.com', 'manager', now())
      ON CONFLICT (login) DO NOTHING;
      `,
      [adminPassword, managerPassword],
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`
      DELETE FROM users WHERE login IN ('admin', 'manager');
    `);
  }
}

module.exports = { SeedAdminAndManager1710000000014 };
