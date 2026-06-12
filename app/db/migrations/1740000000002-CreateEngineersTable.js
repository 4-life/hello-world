class CreateEngineersTable1740000000002 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE engineers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(200),
        specialization VARCHAR(200),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE engineers`);
  }
}

module.exports = { CreateEngineersTable1740000000002 };
