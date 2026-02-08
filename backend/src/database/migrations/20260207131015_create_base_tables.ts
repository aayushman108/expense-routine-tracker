import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Enable Extensions
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // 2. Create Trigger Function
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // 3. Create Tables

  // USERS
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("full_name", 255).notNullable();
    table.string("nickname", 100);
    table.string("email", 255).unique().notNullable();
    table.string("phone", 20);
    table.text("password_hash").notNullable();
    table.jsonb("avatar");
    table.timestamps(true, true);
  });

  // GROUPS
  await knex.schema.createTable("groups", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name", 255).notNullable();
    table.text("description");
    table.text("image_url");
    table.uuid("created_by").notNullable().references("id").inTable("users");
    table.timestamps(true, true);
  });

  // GROUP MEMBERS
  await knex.schema.createTable("group_members", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("group_id")
      .notNullable()
      .references("id")
      .inTable("groups")
      .onDelete("CASCADE");
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table.string("role", 50).defaultTo("member");
    table.timestamp("joined_at").defaultTo(knex.fn.now());
    table.timestamp("left_at").nullable();
    table.unique(["group_id", "user_id"]);
  });

  // EXPENSES
  await knex.schema.createTable("expenses", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("group_id")
      .nullable()
      .references("id")
      .inTable("groups")
      .onDelete("CASCADE");
    table
      .uuid("paid_by")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table.decimal("total_amount", 12, 2).notNullable();
    table.text("description");
    table.date("expense_date").notNullable();
    table.string("currency", 3).defaultTo("NPR");
    table.timestamps(true, true);
  });

  // EXPENSE SPLITS
  await knex.schema.createTable("expense_splits", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("expense_id")
      .notNullable()
      .references("id")
      .inTable("expenses")
      .onDelete("CASCADE");
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table.integer("split_ratio").notNullable();
    table.decimal("share_amount", 12, 2).notNullable();
    table.unique(["expense_id", "user_id"]);
  });

  // PAYMENT METHODS
  await knex.schema.createTable("payment_methods", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("provider", 100).notNullable();
    table.string("external_id", 255);
    table.jsonb("metadata");
    table.boolean("is_verified").defaultTo(false);
    table.boolean("is_default").defaultTo(false);
    table.timestamps(true, true);
  });

  // SETTLEMENTS
  await knex.schema.createTable("settlements", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("group_id")
      .notNullable()
      .references("id")
      .inTable("groups")
      .onDelete("CASCADE");
    table
      .uuid("from_user")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table
      .uuid("to_user")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT");
    table.decimal("amount", 12, 2).notNullable();
    table.date("settlement_month").notNullable();
    table.string("status", 10).defaultTo("pending");
    table.timestamps(true, true);
  });

  // 4. Add Triggers for updated_at
  const tables = [
    "users",
    "groups",
    "expenses",
    "payment_methods",
    "settlements",
  ];
  for (const table of tables) {
    await knex.raw(`
      CREATE TRIGGER update_${table}_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  // 5. Add Performance Indices
  await knex.schema.table("expenses", (table) => {
    table.index("group_id");
    table.index("paid_by");
  });
  await knex.schema.table("expense_splits", (table) => {
    table.index("user_id");
  });
  await knex.schema.table("group_members", (table) => {
    table.index("user_id");
  });
  await knex.schema.table("settlements", (table) => {
    table.index("group_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  const tables = [
    "settlements",
    "payment_methods",
    "expense_splits",
    "expenses",
    "group_members",
    "groups",
    "users",
  ];
  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
  await knex.raw("DROP FUNCTION IF EXISTS update_updated_at_column CASCADE");
  await knex.raw('DROP EXTENSION IF EXISTS "pgcrypto" CASCADE');
}
