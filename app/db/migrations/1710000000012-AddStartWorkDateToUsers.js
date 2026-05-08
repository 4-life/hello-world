class AddStartWorkDateToUsers1710000000012 {
  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN "startWorkDate" DATE;
    `);

    await queryRunner.query(`
      UPDATE users SET "startWorkDate" = '2026-01-01';
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users DROP COLUMN "startWorkDate";
    `);
  }
}

module.exports = { AddStartWorkDateToUsers1710000000012 };
