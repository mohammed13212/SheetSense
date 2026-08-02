import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),

  /**
   * Supabase Auth user ID (UUID string from auth.users.id).
   * Every project is owned by exactly one authenticated user.
   */
  userId: text("user_id").notNull(),

  /** Human-readable name for the project (e.g. "Q1 Sales Analysis"). */
  name: text("name").notNull(),

  /** Optional free-text description. */
  description: text("description"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  /**
   * Tracks the most recent time the project was opened in the workspace.
   * NULL for projects that have never been opened after this column was added.
   * Used to sort Dashboard by "recently opened".
   */
  lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectProjectSchema = createSelectSchema(projectsTable);

// ---------------------------------------------------------------------------
// TypeScript types
// ---------------------------------------------------------------------------

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
