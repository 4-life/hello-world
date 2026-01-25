import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class SeedUsers1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userPassword = await bcrypt.hash("user", 10);
    const adminPassword = await bcrypt.hash("admin", 10);

    await queryRunner.query(
      `
      INSERT INTO users (id, login, password, "firstName", "lastName", email, role, "createdDate")
      VALUES
        (uuid_generate_v4(), 'user', $1, 'John', 'Doe', 'user@example.com', 'user', now()),
        (uuid_generate_v4(), 'admin', $2, 'Admin', 'Boss', 'admin@example.com', 'admin', now());
      `,
      [userPassword, adminPassword]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM users WHERE login IN ('user', 'admin');
    `);
  }
}
