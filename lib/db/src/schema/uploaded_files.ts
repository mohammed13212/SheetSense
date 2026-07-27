import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export const uploadedFilesTable = pgTable("uploaded_files", {
  id: uuid("id").primaryKey().defaultRandom(),

  /** The project this file belongs to. */
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),

  /** Original filename as supplied by the user (e.g. "Sales_2024.xlsx"). */
  originalName: text("original_name").notNull(),

  /**
   * MIME type of the uploaded file.
   * Expected values: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
   * or "text/csv".
   */
  mimeType: text("mime_type").notNull(),

  /** File size in bytes. */
  fileSize: integer("file_size").notNull(),

  /** Total number of rows including the header row. */
  rowCount: integer("row_count").notNull(),

  /** Number of columns in the first / active sheet. */
  colCount: integer("col_count").notNull(),

  /**
   * Ordered list of column header strings extracted from the first row.
   * Stored as a JSON array: ["CustomerID", "Name", "Revenue", ...].
   */
  headers: jsonb("headers").$type<string[]>().notNull().default([]),

  /**
   * All sheet names found in the workbook.
   * For CSV files this will be a single-element array.
   */
  sheetNames: jsonb("sheet_names").$type<string[]>().notNull().default([]),

  /**
   * Serialised DataQuality object (quality score + metric breakdown).
   * Schema mirrors the in-memory DataQuality type in the frontend.
   */
  dataQuality: jsonb("data_quality").$type<Record<string, unknown>>(),

  /** Whether this file has been fully processed and is ready for analysis. */
  isProcessed: boolean("is_processed").notNull().default(false),

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

export const insertUploadedFileSchema = createInsertSchema(
  uploadedFilesTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUploadedFileSchema = createSelectSchema(uploadedFilesTable);

// ---------------------------------------------------------------------------
// TypeScript types
// ---------------------------------------------------------------------------

export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFilesTable.$inferSelect;
