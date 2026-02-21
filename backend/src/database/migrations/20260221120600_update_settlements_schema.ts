import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("settlements", (table) => {
    // 1. Add expense_id and link it to expenses
    table
      .uuid("expense_id")
      .notNullable()
      .references("id")
      .inTable("expenses")
      .onDelete("CASCADE");

    // 2. Add proof_image for payment verification
    table.jsonb("proof_image").nullable();

    // 3. Drop legacy columns
    table.dropColumn("settlement_month");
    table.dropColumn("group_id");

    // 4. Add index for performance
    table.index("expense_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("settlements", (table) => {
    // 1. Revert changes
    table.dropIndex(["expense_id"]);
    table.dropColumn("expense_id");
    table.dropColumn("proof_image");

    // 2. Restore legacy columns
    table.date("settlement_month").notNullable();
    table
      .uuid("group_id")
      .notNullable()
      .references("id")
      .inTable("groups")
      .onDelete("CASCADE");
    table.index("group_id");
  });
}
