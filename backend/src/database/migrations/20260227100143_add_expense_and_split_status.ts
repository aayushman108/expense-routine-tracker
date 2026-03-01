import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Create ENUM types
  await knex.raw(`
    CREATE TYPE expense_status_enum AS ENUM (
      'draft',
      'submitted',
      'verified',
      'rejected'
    );
  `);

  await knex.raw(`
    CREATE TYPE split_status_enum AS ENUM (
      'pending',
      'verified',
      'rejected'
    );
  `);

  // 2. Add columns using ENUM types
  await knex.raw(`
    ALTER TABLE expenses
    ADD COLUMN expense_status expense_status_enum
    NOT NULL DEFAULT 'draft';
  `);

  await knex.raw(`
    ALTER TABLE expense_splits
    ADD COLUMN split_status split_status_enum
    NOT NULL DEFAULT 'pending';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // 1. Drop columns first (required before dropping ENUM)
  await knex.raw(`
    ALTER TABLE expense_splits
    DROP COLUMN IF EXISTS split_status;
  `);

  await knex.raw(`
    ALTER TABLE expenses
    DROP COLUMN IF EXISTS expense_status;
  `);

  // 2. Drop ENUM types
  await knex.raw(`
    DROP TYPE IF EXISTS split_status_enum;
  `);

  await knex.raw(`
    DROP TYPE IF EXISTS expense_status_enum;
  `);
}
