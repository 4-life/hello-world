class CreateClientsTable1740000000007 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE clients (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200),
        phone VARCHAR(20),
        address TEXT,
        "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE clients`);
  }
}

module.exports = { CreateClientsTable1740000000007 };
