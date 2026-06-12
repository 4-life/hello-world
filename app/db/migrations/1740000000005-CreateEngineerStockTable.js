class CreateEngineerStockTable1740000000005 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE engineer_stock (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "engineerId" UUID NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
        "partId" UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
        quantity INT NOT NULL DEFAULT 0,
        "minQuantity" INT NOT NULL DEFAULT 0,
        "updatedDate" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("engineerId", "partId")
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE engineer_stock`);
  }
}

module.exports = { CreateEngineerStockTable1740000000005 };
