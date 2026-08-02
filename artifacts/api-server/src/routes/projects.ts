import { Router, type IRouter } from "express";
import {
  db,
  projectsTable,
  uploadedFilesTable,
  insertProjectSchema,
} from "@workspace/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

/**
 * GET /api/projects
 * Returns all projects owned by the authenticated user.
 * Ordered by last_opened_at DESC NULLS LAST, then created_at DESC so that
 * recently-worked-on projects surface at the top of the Dashboard.
 * Each project includes a summary of its files.
 */
router.get("/projects", requireAuth, async (req, res) => {
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, req.userId!))
    .orderBy(
      sql`${projectsTable.lastOpenedAt} DESC NULLS LAST`,
      desc(projectsTable.createdAt),
    );

  // Attach file summaries for each project
  const allFiles = await db
    .select({
      id: uploadedFilesTable.id,
      projectId: uploadedFilesTable.projectId,
      originalName: uploadedFilesTable.originalName,
      rowCount: uploadedFilesTable.rowCount,
      colCount: uploadedFilesTable.colCount,
      storageKey: uploadedFilesTable.storageKey,
      createdAt: uploadedFilesTable.createdAt,
    })
    .from(uploadedFilesTable)
    .where(
      eq(
        uploadedFilesTable.projectId,
        sql`ANY(ARRAY[${sql.join(
          projects.map((p) => sql`${p.id}::uuid`),
          sql`, `,
        )}])`,
      ),
    )
    .orderBy(uploadedFilesTable.createdAt);

  const filesByProject = new Map<string, typeof allFiles>();
  for (const file of allFiles) {
    if (!filesByProject.has(file.projectId)) {
      filesByProject.set(file.projectId, []);
    }
    filesByProject.get(file.projectId)!.push(file);
  }

  const result = projects.map((p) => ({
    ...p,
    files: filesByProject.get(p.id) ?? [],
  }));

  res.json(result);
});

/**
 * POST /api/projects
 * Creates a new project owned by the authenticated user.
 * Body: { name: string, description?: string | null }
 */
router.post("/projects", requireAuth, async (req, res) => {
  const result = insertProjectSchema.safeParse({
    ...req.body,
    userId: req.userId,
  });

  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const [created] = await db
    .insert(projectsTable)
    .values(result.data)
    .returning();

  res.status(201).json(created);
});

/**
 * GET /api/projects/:projectId
 * Returns a single project with its full file list.
 * Only the owning user can access it.
 */
router.get("/projects/:projectId", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  const [project] = await db
    .select()
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

  res.json({ ...project, files });
});

/**
 * PATCH /api/projects/:projectId
 * Updates the name (and optionally description) of a project. Owner only.
 * Body: { name: string, description?: string }
 */
router.patch("/projects/:projectId", requireAuth, async (req, res) => {
  const { projectId } = req.params;
  const name =
    typeof req.body.name === "string" ? req.body.name.trim() : undefined;

  if (!name) {
    res.status(400).json({ error: "name is required and must be non-empty" });
    return;
  }

  const [updated] = await db
    .update(projectsTable)
    .set({ name, updatedAt: new Date() })
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, req.userId!),
      ),
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(updated);
});

/**
 * PATCH /api/projects/:projectId/touch
 * Updates last_opened_at to now. Called silently when a user opens a project.
 * Used to sort the Dashboard by "recently opened".
 */
router.patch("/projects/:projectId/touch", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  await db
    .update(projectsTable)
    .set({ lastOpenedAt: new Date() })
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, req.userId!),
      ),
    );

  res.status(204).send();
});

/**
 * DELETE /api/projects/:projectId
 * Deletes a project (and its files + relationships via cascade). Owner only.
 */
router.delete("/projects/:projectId", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  const deleted = await db
    .delete(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, req.userId!),
      ),
    )
    .returning({ id: projectsTable.id });

  if (deleted.length === 0) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.status(204).send();
});

export default router;
