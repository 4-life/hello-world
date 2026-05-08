class SeedPavelVacation1710000000011 {
  async up(queryRunner) {
    await queryRunner.query(`
      INSERT INTO vacations (id, "userId", "startDate", "endDate", info)
      SELECT
        uuid_generate_v4(),
        u.id,
        '2026-04-07',
        '2026-04-18',
        'April vacation'
      FROM users u
      WHERE u.login = 'pavel.ovchinnikov';
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      DELETE FROM vacations
      WHERE info = 'April vacation'
        AND "userId" = (SELECT id FROM users WHERE login = 'pavel.ovchinnikov');
    `);
  }
}

module.exports = { SeedPavelVacation1710000000011 };
