import { Router, type IRouter } from "express";
import { db, projectsTable, insertProjectSchema } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

/**
 * GET /api/projects
 * Returns all projects ordered by created_at DESC.
 */
router.get("/projects", async (_req, res) => {
  const projects = await db
    .select()
    .from(projectsTable)
    .orderBy(desc(projectsTable.createdAt));

  res.json(projects);
});

/**
 * POST /api/projects
 * Validates the request body, inserts a new project, and returns it.
 *
 * Body: { name: string, description?: string | null }
 */
router.post("/projects", async (req, res) => {
  const result = insertProjectSchema.safeParse(req.body);

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

export default router;
