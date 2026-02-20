class PasswordNullableConstraint1710000000004 {
  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN password DROP NOT NULL;
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN password SET NOT NULL;
    `);
  }
}

module.exports = { PasswordNullableConstraint1710000000004 };
