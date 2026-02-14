import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("groups", (table) => {
    table.dropColumn("image_url");
    table.jsonb("image");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("groups", (table) => {
    table.dropColumn("image");
    table.text("image_url");
  });
}
