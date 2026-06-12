class SeedClientsAndInvoices1740000000010 {
  async up(queryRunner) {
    await queryRunner.query(`
      INSERT INTO clients (id, name, email, phone, address)
      VALUES
        (uuid_generate_v4(), 'Acme Properties LLC',  'billing@acmeproperties.com', '+1 555 0201', '12 Market St, Springfield'),
        (uuid_generate_v4(), 'Greenfield Holdings',  'accounts@greenfield.com',    '+1 555 0202', '88 Greenfield Ave, Springfield'),
        (uuid_generate_v4(), 'Riverside Apartments', 'manager@riverside.com',      '+1 555 0203', '4 Riverside Dr, Springfield')
    `);

    await queryRunner.query(`
      WITH c AS (SELECT id, name FROM clients ORDER BY "createdDate"),
           o AS (SELECT id, notes FROM orders)
      INSERT INTO invoices (id, "clientId", "orderId", amount, "paymentStatus", "issuedDate", "dueDate", notes)
      SELECT
        uuid_generate_v4(),
        (SELECT id FROM c WHERE name = i.client_name),
        (SELECT id FROM o WHERE notes = i.order_notes),
        i.amount::decimal,
        i.payment_status::payment_status,
        i.issued_date::date,
        i.due_date::date,
        i.notes
      FROM (
        VALUES
          ('Acme Properties LLC',  'Install new split AC unit, 2nd floor office',         '1450.00', 'unpaid',         (now())::date,                    (now() + interval '14 day')::date, 'Installation invoice'),
          ('Greenfield Holdings',  'Compressor not starting, suspect capacitor',          '320.00',  'partially_paid', (now() - interval '1 day')::date, (now() + interval '13 day')::date, 'Repair invoice - deposit received'),
          ('Riverside Apartments', 'Filter replacement and coil cleaning',                '180.00',  'paid',           (now() - interval '3 day')::date, (now() - interval '3 day')::date,  'Maintenance invoice'),
          ('Acme Properties LLC',  NULL,                                                   '600.00',  'unpaid',         (now())::date,                    (now() + interval '30 day')::date, 'Quarterly service contract')
      ) AS i(client_name, order_notes, amount, payment_status, issued_date, due_date, notes)
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DELETE FROM invoices`);
    await queryRunner.query(`DELETE FROM clients`);
  }
}

module.exports = { SeedClientsAndInvoices1740000000010 };
