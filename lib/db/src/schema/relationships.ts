import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod/v4";
import { projectsTable } from "./projects";
import { uploadedFilesTable } from "./uploaded_files";

// ---------------------------------------------------------------------------
// Enum
// ---------------------------------------------------------------------------

/**
 * Human-friendly confidence tier.
 * "high"   → confidence ≥ 90  (auto-created by SheetSense)
 * "medium" → confidence 60–89 (suggested, user must confirm)
 * "low"    → confidence < 60  (weak signal, surfaced for review)
 */
export const confidenceLevelEnum = pgEnum("confidence_level", [
  "high",
  "medium",
  "low",
]);

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export const relationshipsTable = pgTable(
  "relationships",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /** The project both files belong to. */
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),

    // -- Source side --------------------------------------------------------

    /** File that contains the source column. */
    sourceFileId: uuid("source_file_id")
      .notNull()
      .references(() => uploadedFilesTable.id, { onDelete: "cascade" }),

    /** Name of the column in the source file (e.g. "CustomerID"). */
    sourceColumn: text("source_column").notNull(),

    // -- Target side --------------------------------------------------------

    /** File that contains the matching column. */
    targetFileId: uuid("target_file_id")
      .notNull()
      .references(() => uploadedFilesTable.id, { onDelete: "cascade" }),

    /** Name of the column in the target file (e.g. "CustomerID"). */
    targetColumn: text("target_column").notNull(),

    // -- Scoring ------------------------------------------------------------

    /**
     * Numeric confidence score in the range [0, 100].
     * Computed by the detection engine from name similarity,
     * type match, and value-overlap signals.
     */
    confidence: integer("confidence").notNull(),

    /** Bucketed confidence tier derived from the numeric score. */
    confidenceLevel: confidenceLevelEnum("confidence_level").notNull(),

    // -- Metadata -----------------------------------------------------------

    /**
     * True when SheetSense created this connection automatically
     * (confidence ≥ 90).  False when the user created it manually.
     */
    isAutoCreated: boolean("is_auto_created").notNull().default(false),

    /**
     * Optional user-supplied label for this connection
     * (e.g. "Customers linked to Orders").
     * NULL means the UI will render the default "Source → Target" label.
     */
    label: text("label"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Confidence score must be within [0, 100].
    check("confidence_range", sql`${table.confidence} BETWEEN 0 AND 100`),

    // A file cannot be connected to itself (source and target must differ).
    check(
      "different_files",
      sql`${table.sourceFileId} != ${table.targetFileId}`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const insertRelationshipSchema = createInsertSchema(
  relationshipsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectRelationshipSchema = createSelectSchema(relationshipsTable);

// ---------------------------------------------------------------------------
// TypeScript types
// ---------------------------------------------------------------------------

export type InsertRelationship = z.infer<typeof insertRelationshipSchema>;
export type Relationship = typeof relationshipsTable.$inferSelect;
export type ConfidenceLevel = (typeof confidenceLevelEnum.enumValues)[number];
