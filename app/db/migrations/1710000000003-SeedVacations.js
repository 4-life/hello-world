class SeedVacations1710000000003 {
  async up(queryRunner) {
    await queryRunner.query(`
      INSERT INTO vacations (id, "userId", "startDate", "endDate", info)
      SELECT
        uuid_generate_v4(),
        u.id,
        (now() + (random() * interval '30 days'))::date,
        (now() + (random() * interval '30 days') + interval '7 days')::date,
        'Vacation for ' || u.login
      FROM users u
      WHERE u.login LIKE 'user%'
      LIMIT 20
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DELETE FROM vacations WHERE info LIKE 'Vacation for user%'`);
  }
}

module.exports = { SeedVacations1710000000003 };
