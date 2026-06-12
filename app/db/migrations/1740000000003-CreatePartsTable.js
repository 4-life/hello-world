class CreatePartsTable1740000000003 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE parts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(200) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
        description TEXT,
        "createdDate" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE parts`);
  }
}

module.exports = { CreatePartsTable1740000000003 };
