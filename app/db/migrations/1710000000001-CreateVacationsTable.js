class CreateVacationsTable1710000000001 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE vacations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "startDate" DATE NOT NULL,
        "endDate" DATE NOT NULL,
        info TEXT
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE vacations`);
  }
}

module.exports = { CreateVacationsTable1710000000001 };
