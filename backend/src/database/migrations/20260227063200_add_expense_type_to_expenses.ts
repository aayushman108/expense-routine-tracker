import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Add expense_type column as nullable first
  await knex.schema.table("expenses", (table) => {
    table.string("expense_type", 20).nullable();
  });

  // 2. Update existing records
  await knex("expenses")
    .whereNotNull("group_id")
    .update({ expense_type: "group" });

  await knex("expenses")
    .whereNull("group_id")
    .update({ expense_type: "personal" });

  // 3. Set NOT NULL and add constraints
  await knex.raw("ALTER TABLE expenses ALTER COLUMN expense_type SET NOT NULL");

  await knex.raw(`
    ALTER TABLE expenses 
    ADD CONSTRAINT expenses_expense_type_check 
    CHECK (expense_type IN ('personal', 'group'))
  `);

  await knex.raw(`
    ALTER TABLE expenses 
    ADD CONSTRAINT expenses_group_id_nullability_check 
    CHECK (
      (expense_type = 'personal' AND group_id IS NULL)
      OR
      (expense_type = 'group' AND group_id IS NOT NULL)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_group_id_nullability_check",
  );
  await knex.raw(
    "ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_expense_type_check",
  );

  await knex.schema.table("expenses", (table) => {
    table.dropColumn("expense_type");
  });
}
