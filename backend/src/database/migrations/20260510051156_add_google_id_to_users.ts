import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("users", (table) => {
    table.string("google_id", 255).unique().nullable();
    table.text("password_hash").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("users", (table) => {
    table.dropColumn("google_id");
    table.text("password_hash").notNullable().alter();
  });
}
