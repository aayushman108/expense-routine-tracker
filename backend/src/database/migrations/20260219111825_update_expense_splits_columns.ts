import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("expense_splits", (table) => {
    // 1. Rename columns
    table.renameColumn("split_ratio", "split_percentage");
    table.renameColumn("share_amount", "split_amount");
  });

  await knex.schema.table("expense_splits", (table) => {
    // 2. Change column types and add constraints
    // For split_percentage: Switch to decimal for precision (0.00 to 100.00)
    table.decimal("split_percentage", 5, 2).alter().notNullable();

    // For split_amount: Already decimal, but ensuring notNullable and positive
    table.decimal("split_amount", 12, 2).alter().notNullable();
  });

  // 3. Add raw check constraints
  await knex.raw(`
    ALTER TABLE expense_splits 
    ADD CONSTRAINT check_split_percentage_range 
    CHECK (split_percentage >= 0 AND split_percentage <= 100)
  `);

  await knex.raw(`
    ALTER TABLE expense_splits 
    ADD CONSTRAINT check_split_amount_positive 
    CHECK (split_amount >= 0)
  `);
}

export async function down(knex: Knex): Promise<void> {
  // 1. Remove constraints
  await knex.raw(
    "ALTER TABLE expense_splits DROP CONSTRAINT IF EXISTS check_split_percentage_range",
  );
  await knex.raw(
    "ALTER TABLE expense_splits DROP CONSTRAINT IF EXISTS check_split_amount_positive",
  );

  await knex.schema.table("expense_splits", (table) => {
    // 2. Revert types (split_percentage back to split_ratio integer)
    table.integer("split_percentage").alter().notNullable();

    // 3. Rename columns back
    table.renameColumn("split_percentage", "split_ratio");
    table.renameColumn("split_amount", "share_amount");
  });
}
