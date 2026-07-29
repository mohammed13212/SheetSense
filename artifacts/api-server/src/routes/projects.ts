import { Router, type IRouter } from "express";
import { db, projectsTable, uploadedFilesTable, insertProjectSchema } from "@workspace/db";
import { desc, eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

/**
 * GET /api/projects
 * Returns all projects owned by the authenticated user, ordered by created_at DESC.
 */
router.get("/projects", requireAuth, async (req, res) => {
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, req.userId!))
    .orderBy(desc(projectsTable.createdAt));

  res.json(projects);
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
 * Returns a single project with its files.
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
        eq(projectsTable.userId, req.userId!)
      )
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
  const name = typeof req.body.name === "string" ? req.body.name.trim() : undefined;

  if (!name) {
    res.status(400).json({ error: "name is required and must be non-empty" });
    return;
  }

  const [updated] = await db
    .update(projectsTable)
    .set({ name })
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, req.userId!)
      )
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(updated);
});

/**
 * DELETE /api/projects/:projectId
 * Deletes a project (and its files via cascade). Only the owner can delete.
 */
router.delete("/projects/:projectId", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  const deleted = await db
    .delete(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, req.userId!)
      )
    )
    .returning({ id: projectsTable.id });

  if (deleted.length === 0) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.status(204).send();
});

export default router;
