const bcrypt = require('bcrypt');

class SeedUsers1710000000002 {
  async up(queryRunner) {
    const userPassword = await bcrypt.hash('user123', 10);
    const adminPassword = await bcrypt.hash('admin', 10);
    const managerPassword = await bcrypt.hash('manager', 10);

    await queryRunner.query(
      `
      INSERT INTO users (id, login, password, "firstName", "lastName", email, role, "startWorkDate", "createdDate")
      VALUES
        (uuid_generate_v4(), 'user',    $1, 'John',    'Doe',  'user@example.com',    'user',    '2026-01-01', now()),
        (uuid_generate_v4(), 'admin',   $2, 'Admin',   'Boss', 'admin@example.com',   'admin',   '2026-01-01', now()),
        (uuid_generate_v4(), 'manager', $3, 'Manager', 'Boss', 'manager@example.com', 'manager', '2026-01-01', now())
      `,
      [userPassword, adminPassword, managerPassword],
    );

    const password = await bcrypt.hash('user123', 10);
    const valuesSql = Array.from({ length: 100 }, (_, i) => {
      const n = i + 1;
      return `(uuid_generate_v4(), 'user${n}', $1, 'User${n}', 'Test', 'user${n}@example.com', 'user', '2026-01-01', now())`;
    }).join(',\n');

    await queryRunner.query(
      `INSERT INTO users (id, login, password, "firstName", "lastName", email, role, "startWorkDate", "createdDate") VALUES ${valuesSql}`,
      [password],
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DELETE FROM users WHERE login IN ('user', 'admin', 'manager') OR login LIKE 'user%'`);
  }
}

module.exports = { SeedUsers1710000000002 };
