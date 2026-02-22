import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Clear existing settlements with CASCADE to handle foreign key dependencies
  await knex.raw("TRUNCATE TABLE settlements CASCADE");

  // 1. Update expense_splits
  const hasSettlementId = await knex.schema.hasColumn(
    "expense_splits",
    "settlement_id",
  );
  if (!hasSettlementId) {
    await knex.schema.table("expense_splits", (table) => {
      table
        .uuid("settlement_id")
        .nullable()
        .references("id")
        .inTable("settlements")
        .onDelete("SET NULL");
    });
  }

  // 2. Update settlements table - Drop obsolete columns
  const dropCols = ["expense_split_id", "confirmed_at", "confirmed_by"];
  for (const col of dropCols) {
    if (await knex.schema.hasColumn("settlements", col)) {
      await knex.schema.table("settlements", (table) => {
        table.dropColumn(col);
      });
    }
  }

  // 3. Update settlements table - Add missing columns
  const addCols: Record<string, (table: any) => void> = {
    group_id: (table) =>
      table
        .uuid("group_id")
        .notNullable()
        .references("id")
        .inTable("groups")
        .onDelete("CASCADE"),
    from_user_id: (table) =>
      table
        .uuid("from_user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE"),
    to_user_id: (table) =>
      table
        .uuid("to_user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE"),
    amount: (table) => table.decimal("amount", 12, 2).notNullable(),
    reviewed_at: (table) => table.timestamp("reviewed_at").nullable(),
    reviewed_by: (table) =>
      table
        .uuid("reviewed_by")
        .nullable()
        .references("id")
        .inTable("users")
        .onDelete("SET NULL"),
  };

  for (const [col, addFn] of Object.entries(addCols)) {
    if (!(await knex.schema.hasColumn("settlements", col))) {
      await knex.schema.table("settlements", (table) => {
        addFn(table);
      });
    }
  }

  // Add precision CHECK constraint for amount
  await knex.raw(
    "ALTER TABLE settlements DROP CONSTRAINT IF EXISTS settlements_amount_check",
  );
  await knex.raw(
    "ALTER TABLE settlements ADD CONSTRAINT settlements_amount_check CHECK (amount <> 0)",
  );

  // Update status constraint
  await knex.raw(`
    ALTER TABLE settlements 
    DROP CONSTRAINT IF EXISTS settlements_status_check;
    
    ALTER TABLE settlements 
    ADD CONSTRAINT settlements_status_check 
    CHECK (status IN ('pending', 'paid', 'confirmed', 'rejected'));
  `);
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasColumn("expense_splits", "settlement_id")) {
    await knex.schema.table("expense_splits", (table) => {
      table.dropColumn("settlement_id");
    });
  }

  await knex.schema.table("settlements", (table) => {
    // Basic cleanup
    const toDrop = [
      "group_id",
      "from_user_id",
      "to_user_id",
      "amount",
      "reviewed_at",
      "reviewed_by",
    ];
    for (const col of toDrop) {
      // table.dropColumn(col); // Sync only in callback
    }
  });
}
