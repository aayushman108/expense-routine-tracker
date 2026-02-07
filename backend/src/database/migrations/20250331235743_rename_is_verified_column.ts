import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.table("users", (table) => {
    table.renameColumn("isVerified", "is_verified");
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.table("users", (table) => {
    table.renameColumn("is_verified", "isVerified");
  });
};
