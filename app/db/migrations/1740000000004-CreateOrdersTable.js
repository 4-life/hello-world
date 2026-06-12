class CreateOrdersTable1740000000004 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TYPE order_type AS ENUM ('installation', 'maintenance', 'repair')
    `);

    await queryRunner.query(`
      CREATE TYPE order_status AS ENUM ('new', 'scheduled', 'in_progress', 'completed', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TYPE payment_status AS ENUM ('unpaid', 'partially_paid', 'paid')
    `);

    await queryRunner.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderNumber" SERIAL UNIQUE,
        type order_type NOT NULL,
        status order_status NOT NULL DEFAULT 'new',
        "paymentStatus" payment_status NOT NULL DEFAULT 'unpaid',
        "scheduledDate" DATE,
        "timeWindowStart" TIME,
        "timeWindowEnd" TIME,
        notes TEXT,
        "engineerId" UUID REFERENCES engineers(id) ON DELETE SET NULL,
        "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE orders`);
    await queryRunner.query(`DROP TYPE payment_status`);
    await queryRunner.query(`DROP TYPE order_status`);
    await queryRunner.query(`DROP TYPE order_type`);
  }
}

module.exports = { CreateOrdersTable1740000000004 };
