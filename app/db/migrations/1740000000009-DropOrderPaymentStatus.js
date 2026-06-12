class DropOrderPaymentStatus1740000000009 {
  async up(queryRunner) {
    await queryRunner.query(`ALTER TABLE orders DROP COLUMN "paymentStatus"`);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE orders ADD COLUMN "paymentStatus" payment_status NOT NULL DEFAULT 'unpaid'
    `);
  }
}

module.exports = { DropOrderPaymentStatus1740000000009 };
