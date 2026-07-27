import { Router, type IRouter } from "express";
import { db, projectsTable, uploadedFilesTable, insertUploadedFileSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

/** Coerce the URL param into a UUID-shaped string for the FK lookup. */
const projectIdParam = z.object({
  projectId: z.string().uuid("projectId must be a valid UUID"),
});

/**
 * POST /api/projects/:projectId/files
 * Validates the project exists, then inserts an uploaded_files record.
 */
router.post("/projects/:projectId/files", async (req, res) => {
  // -- Validate route param ---------------------------------------------------
  const paramResult = projectIdParam.safeParse(req.params);

  if (!paramResult.success) {
    res.status(400).json({ error: paramResult.error.flatten() });
    return;
  }

  const { projectId } = paramResult.data;

  // -- Confirm project exists -------------------------------------------------
  const [project] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .limit(1);

  if (!project) {
    res.status(404).json({ error: `Project ${projectId} not found` });
    return;
  }

  // -- Validate request body --------------------------------------------------
  const bodyResult = insertUploadedFileSchema.safeParse({
    ...req.body,
    projectId,
  });

  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.flatten() });
    return;
  }

  // -- Insert and return ------------------------------------------------------
  const [created] = await db
    .insert(uploadedFilesTable)
    .values(bodyResult.data)
    .returning();

  res.status(201).json(created);
});

export default router;
