import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),

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
