import { Router, type IRouter } from "express";
import {
  db,
  projectsTable,
  relationshipsTable,
  uploadedFilesTable,
  insertRelationshipSchema,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// ── Ownership guard (shared helper) ──────────────────────────────────────────

async function verifyProjectOwnership(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const [project] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(
      and(eq(projectsTable.id, projectId), eq(projectsTable.userId, userId)),
    )
    .limit(1);
  return !!project;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/projects/:projectId/relationships
 * Returns all relationships for a project. Owner-only.
 */
router.get(
  "/projects/:projectId/relationships",
  requireAuth,
  async (req, res) => {
    const { projectId } = req.params;

    const isOwner = await verifyProjectOwnership(projectId, req.userId!);
    if (!isOwner) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const rows = await db
      .select()
      .from(relationshipsTable)
      .where(eq(relationshipsTable.projectId, projectId))
      .orderBy(relationshipsTable.createdAt);

    res.json(rows);
  },
);

/**
 * POST /api/projects/:projectId/relationships
 * Creates a new relationship between two files in the project. Owner-only.
 *
 * Body: {
 *   sourceFileId: uuid,
 *   sourceColumn: string,
 *   targetFileId: uuid,
 *   targetColumn: string,
 *   confidence: number (0-100),
 *   confidenceLevel: "high" | "medium" | "low",
 *   isAutoCreated?: boolean,
 *   label?: string | null,
 * }
 */
router.post(
  "/projects/:projectId/relationships",
  requireAuth,
  async (req, res) => {
    const { projectId } = req.params;

    const isOwner = await verifyProjectOwnership(projectId, req.userId!);
    if (!isOwner) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Validate that both files belong to this project
    const { sourceFileId, targetFileId } = req.body;
    if (sourceFileId && targetFileId) {
      const files = await db
        .select({ id: uploadedFilesTable.id })
        .from(uploadedFilesTable)
        .where(
          and(
            eq(uploadedFilesTable.projectId, projectId),
          ),
        );
      const fileIds = new Set(files.map((f) => f.id));
      if (!fileIds.has(sourceFileId) || !fileIds.has(targetFileId)) {
        res.status(400).json({ error: "Files do not belong to this project" });
        return;
      }
    }

    const result = insertRelationshipSchema.safeParse({
      ...req.body,
      projectId,
    });

    if (!result.success) {
      res.status(400).json({ error: result.error.flatten() });
      return;
    }

    const [created] = await db
      .insert(relationshipsTable)
      .values(result.data)
      .returning();

    res.status(201).json(created);
  },
);

/**
 * DELETE /api/projects/:projectId/relationships/:relationshipId
 * Deletes a relationship. Owner-only.
 */
router.delete(
  "/projects/:projectId/relationships/:relationshipId",
  requireAuth,
  async (req, res) => {
    const { projectId, relationshipId } = req.params;

    const isOwner = await verifyProjectOwnership(projectId, req.userId!);
    if (!isOwner) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const deleted = await db
      .delete(relationshipsTable)
      .where(
        and(
          eq(relationshipsTable.id, relationshipId),
          eq(relationshipsTable.projectId, projectId),
        ),
      )
      .returning({ id: relationshipsTable.id });

    if (deleted.length === 0) {
      res.status(404).json({ error: "Relationship not found" });
      return;
    }

    res.status(204).send();
  },
);

export default router;
