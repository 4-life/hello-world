class SeedVacations1710000000003 {
  async up(queryRunner) {
    await queryRunner.query(`
      WITH seeded AS (
        SELECT
          u.id,
          u.login,
          (now() + ((random() * 60 + (t.n - 1) * 90))::int * interval '1 day')::date AS start_date
        FROM users u
        CROSS JOIN (VALUES (1), (2)) AS t(n)
        WHERE u.login LIKE 'user%'
      )
      INSERT INTO vacations (id, "userId", "startDate", "endDate", info)
      SELECT
        uuid_generate_v4(),
        id,
        start_date,
        (start_date + (1 + floor(random() * 14))::int * interval '1 day')::date,
        'Vacation for ' || login
      FROM seeded
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DELETE FROM vacations WHERE info LIKE 'Vacation for user%'`);
  }
}

module.exports = { SeedVacations1710000000003 };
