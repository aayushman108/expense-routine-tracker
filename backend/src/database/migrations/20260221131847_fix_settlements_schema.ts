import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Clear existing settlements as they are incompatible with the new schema
  // and we don't have enough data to migrate them accurately
  await knex("settlements").truncate();

  await knex.schema.table("settlements", (table) => {
    // 1. Add expense_split_id and link it to expense_splits
    table
      .uuid("expense_split_id")
      .nullable()
      .references("id")
      .inTable("expense_splits")
      .onDelete("CASCADE");

    // 2. Drop legacy columns
    // Use dropColumn for each to avoid precision issues if some don't exist
    // but psql drop column is generally okay.
    const dropCols = ["from_user", "to_user", "amount", "expense_id"];
    for (const col of dropCols) {
      // Knex doesn't have hasColumn check inside table() easily without async
    }

    table.dropColumn("from_user");
    table.dropColumn("to_user");
    table.dropColumn("amount");
    table.dropColumn("expense_id");

    // 3. Add index for performance
    table.index("expense_split_id");
  });

  // Now make it not null
  await knex.schema.alterTable("settlements", (table) => {
    table.uuid("expense_split_id").notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("settlements", (table) => {
    table.dropIndex(["expense_split_id"]);
    table.dropColumn("expense_split_id");

    table.uuid("from_user").references("id").inTable("users");
    table.uuid("to_user").references("id").inTable("users");
    table.decimal("amount", 12, 2);
    table
      .uuid("expense_id")
      .references("id")
      .inTable("expenses")
      .onDelete("CASCADE");
  });
}
