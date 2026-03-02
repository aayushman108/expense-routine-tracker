import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE payment_methods DROP COLUMN IF EXISTS external_id`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE payment_methods ADD COLUMN external_id VARCHAR(255)`,
  );
}
