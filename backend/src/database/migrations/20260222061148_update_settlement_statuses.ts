import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("settlements", (table) => {
    // We already have 'status'. Let's ensure it can handle 'settled'
    // If it was a string with a constraint, we might need to update it.
    // In schema.sql it's VARCHAR(10) DEFAULT 'pending'

    table.timestamp("paid_at").nullable();
    table.timestamp("confirmed_at").nullable();

    // Add columns for review
    table.uuid("confirmed_by").nullable().references("id").inTable("users");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("settlements", (table) => {
    table.dropColumn("paid_at");
    table.dropColumn("confirmed_at");
    table.dropColumn("confirmed_by");
  });
}
