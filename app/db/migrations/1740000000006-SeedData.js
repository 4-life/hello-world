const bcrypt = require('bcrypt');

class SeedData1740000000006 {
  async up(queryRunner) {
    const userPassword = await bcrypt.hash('user123', 10);
    const adminPassword = await bcrypt.hash('admin', 10);
    const managerPassword = await bcrypt.hash('manager', 10);

    await queryRunner.query(
      `
      INSERT INTO users (id, login, password, "firstName", "lastName", email, role, "createdDate")
      VALUES
        (uuid_generate_v4(), 'user',    $1, 'John',    'Doe',  'user@example.com',    'user',    now()),
        (uuid_generate_v4(), 'admin',   $2, 'Admin',   'Boss', 'admin@example.com',   'admin',   now()),
        (uuid_generate_v4(), 'manager', $3, 'Manager', 'Boss', 'manager@example.com', 'manager', now())
      `,
      [userPassword, adminPassword, managerPassword],
    );

    await queryRunner.query(`
      INSERT INTO engineers (id, "firstName", "lastName", phone, email, specialization, "isActive")
      VALUES
        (uuid_generate_v4(), 'Mike',   'Sullivan', '+1 555 0101', 'mike.sullivan@example.com',   'HVAC installation', true),
        (uuid_generate_v4(), 'Carlos', 'Reyes',    '+1 555 0102', 'carlos.reyes@example.com',    'Refrigeration repair', true),
        (uuid_generate_v4(), 'Anna',   'Kowalski', '+1 555 0103', 'anna.kowalski@example.com',   'Maintenance & diagnostics', true),
        (uuid_generate_v4(), 'David',  'Okafor',   '+1 555 0104', 'david.okafor@example.com',    'HVAC installation', false)
    `);

    await queryRunner.query(`
      INSERT INTO parts (id, name, sku, unit, description)
      VALUES
        (uuid_generate_v4(), 'Air filter 20x20',          'FLT-2020', 'pcs', 'Standard pleated air filter'),
        (uuid_generate_v4(), 'R410A refrigerant',         'REF-410A', 'kg',  'Refrigerant for residential AC units'),
        (uuid_generate_v4(), 'Compressor capacitor 35uF', 'CAP-035',  'pcs', 'Run capacitor for compressor motor'),
        (uuid_generate_v4(), 'Thermostat - digital',      'THM-DGT',  'pcs', 'Programmable digital thermostat'),
        (uuid_generate_v4(), 'Copper pipe 1/2in',         'PIPE-12',  'm',   'Refrigerant line copper pipe'),
        (uuid_generate_v4(), 'Contactor 30A',             'CTR-030',  'pcs', '30A definite purpose contactor')
    `);

    await queryRunner.query(`
      WITH e AS (SELECT id, "firstName" FROM engineers ORDER BY "createdDate")
      INSERT INTO orders (id, type, status, "paymentStatus", "scheduledDate", "timeWindowStart", "timeWindowEnd", notes, "engineerId")
      SELECT
        uuid_generate_v4(),
        o.type::order_type,
        o.status::order_status,
        o.payment_status::payment_status,
        o.scheduled_date::date,
        o.window_start::time,
        o.window_end::time,
        o.notes,
        (SELECT id FROM e WHERE "firstName" = o.engineer_first_name)
      FROM (
        VALUES
          ('installation', 'scheduled',   'unpaid',         (now() + interval '1 day')::date,  '09:00', '12:00', 'Install new split AC unit, 2nd floor office', 'Mike'),
          ('maintenance',  'new',         'unpaid',         (now() + interval '2 day')::date,  '13:00', '15:00', 'Annual maintenance check', NULL),
          ('repair',       'in_progress', 'partially_paid', (now())::date,                     '10:00', '14:00', 'Compressor not starting, suspect capacitor', 'Carlos'),
          ('maintenance',  'completed',   'paid',           (now() - interval '3 day')::date,  '08:00', '10:00', 'Filter replacement and coil cleaning', 'Anna'),
          ('installation', 'new',         'unpaid',         NULL,                               NULL,    NULL,    'New build - awaiting site access', NULL),
          ('repair',       'cancelled',   'unpaid',         (now() - interval '1 day')::date,  '11:00', '13:00', 'Customer cancelled appointment', NULL)
      ) AS o(type, status, payment_status, scheduled_date, window_start, window_end, notes, engineer_first_name)
    `);

    await queryRunner.query(`
      INSERT INTO engineer_stock (id, "engineerId", "partId", quantity, "minQuantity")
      SELECT uuid_generate_v4(), e.id, p.id, s.quantity, s.min_quantity
      FROM (
        VALUES
          ('Mike',   'FLT-2020', 8,  5),
          ('Mike',   'REF-410A', 2,  3),
          ('Mike',   'THM-DGT',  4,  2),
          ('Carlos', 'CAP-035',  1,  3),
          ('Carlos', 'CTR-030',  5,  2),
          ('Carlos', 'PIPE-12',  10, 5),
          ('Anna',   'FLT-2020', 6,  5),
          ('Anna',   'REF-410A', 4,  3)
      ) AS s(engineer_first_name, sku, quantity, min_quantity)
      JOIN engineers e ON e."firstName" = s.engineer_first_name
      JOIN parts p ON p.sku = s.sku
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DELETE FROM engineer_stock`);
    await queryRunner.query(`DELETE FROM orders`);
    await queryRunner.query(`DELETE FROM parts`);
    await queryRunner.query(`DELETE FROM engineers`);
    await queryRunner.query(
      `DELETE FROM users WHERE login IN ('user', 'admin', 'manager')`,
    );
  }
}

module.exports = { SeedData1740000000006 };
