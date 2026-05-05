import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("notifications", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("title").notNullable();
    table.text("message").notNullable();
    table.string("type").notNullable(); // e.g., 'EXPENSE_CREATED', 'SETTLEMENT_PAID'
    table.jsonb("data").nullable(); // For deep linking and extra metadata
    table.boolean("is_read").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Add index for faster fetching of a user's notifications
  await knex.schema.table("notifications", (table) => {
    table.index(["user_id", "created_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("notifications");
}
