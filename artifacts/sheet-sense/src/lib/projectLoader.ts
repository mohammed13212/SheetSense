/**
 * projectLoader — loads a persisted project from the API and object storage.
 *
 * On project open:
 *   1. Fetch project metadata + file list from the API.
 *   2. For each file that has a storageKey, download the binary from object
 *      storage and re-parse it in the browser using the existing parseFile
 *      utility. This makes the analysis fully live — no stale snapshots.
 *   3. Fetch the project's persisted relationships.
 *
 * Files without a storageKey (uploaded before object storage was enabled)
 * are skipped gracefully; the user will see them in the file list but cannot
 * re-analyse them without re-uploading.
 */

import { supabase } from "@/lib/supabase";
import { parseFile } from "@/lib/parseFile";
import type { ActiveProject, PersistedRelationship, ProjectFile } from "@/store/ProjectContext";
import type { Dataset } from "@/types";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ─── Auth header helper ───────────────────────────────────────────────────────

async function authHeader(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const token = await authHeader();
  const res = await fetch(`${BASE}${path}`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Download a file binary from object storage and return a browser File object.
 * The storageKey is the value returned by the upload endpoint (e.g. /objects/uploads/uuid).
 */
async function downloadStorageFile(
  storageKey: string,
  originalName: string,
  mimeType: string,
): Promise<File> {
  const token = await authHeader();
  // storageKey is like "/objects/uploads/uuid"
  // Storage serve route is at /api/storage/objects/<path>
  // so we strip the leading "/objects" prefix to get the wildcard portion
  const servePath = storageKey.replace(/^\/objects/, "");
  const url = `${BASE}/api/storage/objects${servePath}`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Storage fetch failed: ${url} → ${res.status}`);

  const blob = await res.blob();
  return new File([blob], originalName, {
    type: mimeType || "application/octet-stream",
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface ProjectWithFiles extends ActiveProject {
  files: ProjectFile[];
}

export interface LoadedProject {
  project: ActiveProject;
  /** Datasets hydrated from object storage (one per file with a storageKey). */
  datasets: Dataset[];
  /** Files that could not be loaded (missing storageKey or fetch error). */
  unavailableFiles: ProjectFile[];
  relationships: PersistedRelationship[];
}

/**
 * Load a project and all its associated data, ready to populate the contexts.
 */
export async function loadProject(projectId: string): Promise<LoadedProject> {
  // 1. Fetch project metadata + file list
  const project = await apiFetch<ProjectWithFiles>(`/api/projects/${projectId}`);

  // 2. Mark project as recently opened (fire-and-forget)
  fetch(`${BASE}/api/projects/${projectId}/touch`, {
    method: "PATCH",
    headers: (await authHeader())
      ? { Authorization: `Bearer ${await authHeader()}` }
      : {},
  }).catch(() => {/* non-critical */});

  // 3. Download and parse each file from object storage
  const datasets: Dataset[] = [];
  const unavailableFiles: ProjectFile[] = [];

  for (const file of project.files) {
    if (!file.storageKey) {
      unavailableFiles.push(file);
      continue;
    }
    try {
      const binary = await downloadStorageFile(
        file.storageKey,
        file.originalName,
        file.mimeType,
      );
      const parsed = await parseFile(binary);
      // Use a stable dataset id derived from the server file id
      const datasetId = `ds_${file.id}`;
      const dataset: Dataset = {
        id: datasetId,
        uploadedAt: new Date(file.createdAt).getTime(),
        file: parsed,
        displayName: file.displayName ?? undefined,
        serverFileId: file.id,
      };
      datasets.push(dataset);
    } catch {
      unavailableFiles.push(file);
    }
  }

  // 4. Fetch relationships
  const relationships = await apiFetch<PersistedRelationship[]>(
    `/api/projects/${projectId}/relationships`,
  );

  return { project, datasets, unavailableFiles, relationships };
}

/**
 * Upload a raw File binary to object storage and return the objectPath.
 * Step 1: request a presigned URL from our API.
 * Step 2: PUT the binary directly to GCS.
 */
export async function uploadToStorage(file: File): Promise<string> {
  const token = await authHeader();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Step 1: get presigned URL
  const res = await fetch(`${BASE}/api/storage/uploads/request-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!res.ok) throw new Error(`request-url failed: ${res.status}`);
  const { uploadURL, objectPath } = await res.json() as {
    uploadURL: string;
    objectPath: string;
  };

  // Step 2: upload binary directly to GCS
  const putRes = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!putRes.ok) throw new Error(`GCS PUT failed: ${putRes.status}`);

  return objectPath;
}
