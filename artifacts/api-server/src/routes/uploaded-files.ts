import { Router, type IRouter } from "express";
import {
  db,
  projectsTable,
  uploadedFilesTable,
  insertUploadedFileSchema,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { ObjectStorageService } from "../lib/objectStorage";

const storage = new ObjectStorageService();

const router: IRouter = Router();

/** Coerce the URL param into a UUID-shaped string for the FK lookup. */
const projectIdParam = z.object({
  projectId: z.string().uuid("projectId must be a valid UUID"),
});

/**
 * GET /api/projects/:projectId/files
 * Returns all files for a project. Requires ownership.
 */
router.get("/projects/:projectId/files", requireAuth, async (req, res) => {
  const paramResult = projectIdParam.safeParse(req.params);
  if (!paramResult.success) {
    res.status(400).json({ error: paramResult.error.flatten() });
    return;
  }

  const { projectId } = paramResult.data;

  // Verify ownership
  const [project] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, req.userId!),
      ),
    )
    .limit(1);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const files = await db
    .select()
    .from(uploadedFilesTable)
    .where(eq(uploadedFilesTable.projectId, projectId))
    .orderBy(uploadedFilesTable.createdAt);

  res.json(files);
});

/**
 * POST /api/projects/:projectId/files
 * Associates an uploaded file record with a project. Requires ownership.
 * Accepts an optional storageKey (the GCS object path) for file retrieval.
 */
router.post("/projects/:projectId/files", requireAuth, async (req, res) => {
  const paramResult = projectIdParam.safeParse(req.params);
  if (!paramResult.success) {
    res.status(400).json({ error: paramResult.error.flatten() });
    return;
  }

  const { projectId } = paramResult.data;

  // Verify ownership
  const [project] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, req.userId!),
      ),
    )
    .limit(1);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const bodyResult = insertUploadedFileSchema.safeParse({
    ...req.body,
    projectId,
  });

  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.flatten() });
    return;
  }

  const [created] = await db
    .insert(uploadedFilesTable)
    .values(bodyResult.data)
    .returning();

  res.status(201).json(created);
});

/**
 * PATCH /api/projects/:projectId/files/:fileId
 * Updates the displayName of a file. Requires ownership of the parent project.
 */
router.patch(
  "/projects/:projectId/files/:fileId",
  requireAuth,
  async (req, res) => {
    const paramResult = z
      .object({
        projectId: z.string().uuid("projectId must be a valid UUID"),
        fileId: z.string().uuid("fileId must be a valid UUID"),
      })
      .safeParse(req.params);

    if (!paramResult.success) {
      res.status(400).json({ error: paramResult.error.flatten() });
      return;
    }

    const { projectId, fileId } = paramResult.data;

    // Verify ownership via project
    const [project] = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, projectId),
          eq(projectsTable.userId, req.userId!),
        ),
      )
      .limit(1);

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const bodyResult = z
      .object({ displayName: z.string().nullable() })
      .safeParse(req.body);

    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.flatten() });
      return;
    }

    const [updated] = await db
      .update(uploadedFilesTable)
      .set({ displayName: bodyResult.data.displayName })
      .where(
        and(
          eq(uploadedFilesTable.id, fileId),
          eq(uploadedFilesTable.projectId, projectId),
        ),
      )
      .returning();

    if (!updated) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    res.json(updated);
  },
);

/**
 * DELETE /api/projects/:projectId/files/:fileId
 * Deletes a file record and its corresponding object from storage.
 * Requires ownership of the parent project.
 */
router.delete(
  "/projects/:projectId/files/:fileId",
  requireAuth,
  async (req, res) => {
    const paramResult = z
      .object({
        projectId: z.string().uuid("projectId must be a valid UUID"),
        fileId: z.string().uuid("fileId must be a valid UUID"),
      })
      .safeParse(req.params);

    if (!paramResult.success) {
      res.status(400).json({ error: paramResult.error.flatten() });
      return;
    }

    const { projectId, fileId } = paramResult.data;

    // Verify ownership via project
    const [project] = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, projectId),
          eq(projectsTable.userId, req.userId!),
        ),
      )
      .limit(1);

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Fetch the file to get its storageKey before deleting
    const [file] = await db
      .select()
      .from(uploadedFilesTable)
      .where(
        and(
          eq(uploadedFilesTable.id, fileId),
          eq(uploadedFilesTable.projectId, projectId),
        ),
      )
      .limit(1);

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Delete the DB record first
    await db
      .delete(uploadedFilesTable)
      .where(eq(uploadedFilesTable.id, fileId));

    // Delete from object storage (best-effort — DB record is already gone)
    if (file.storageKey) {
      storage.deleteObject(file.storageKey).catch((err) => {
        req.log.warn({ err, storageKey: file.storageKey }, "Failed to delete object from storage");
      });
    }

    res.status(204).send();
  },
);

export default router;
