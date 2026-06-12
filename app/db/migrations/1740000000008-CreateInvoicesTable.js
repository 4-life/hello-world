class CreateInvoicesTable1740000000008 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE invoices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "invoiceNumber" SERIAL UNIQUE,
        "clientId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        "orderId" UUID UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "paymentStatus" payment_status NOT NULL DEFAULT 'unpaid',
        "issuedDate" DATE NOT NULL DEFAULT CURRENT_DATE,
        "dueDate" DATE,
        notes TEXT,
        "createdDate" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE invoices`);
  }
}

module.exports = { CreateInvoicesTable1740000000008 };
