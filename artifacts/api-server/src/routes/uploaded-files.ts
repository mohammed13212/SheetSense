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

export default router;
