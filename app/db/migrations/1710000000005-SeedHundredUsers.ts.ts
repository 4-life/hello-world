import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedHundredUsers1710000000100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('user123', 10);

    // Build many VALUES rows
    const valuesSql = Array.from({ length: 100 }, (_, i) => {
      const n = i + 1;

      return `
        (uuid_generate_v4(), 
         'user${n}', 
         $1, 
         'User${n}',
         'Test',
         'user${n}@example.com',
         'user',
         now())
      `;
    }).join(',\n');

    await queryRunner.query(
      `
      INSERT INTO users (
        id,
        login,
        password,
        "firstName",
        "lastName",
        email,
        role,
        "createdDate"
      ) VALUES
      ${valuesSql};
      `,
      [password]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM users 
      WHERE login LIKE 'user%';
    `);
  }
}
