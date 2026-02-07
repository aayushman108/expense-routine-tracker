import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("username").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.jsonb("avatar").nullable();
    table.boolean("isVerified").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists("users");
};
