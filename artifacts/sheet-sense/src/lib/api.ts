/**
 * Thin API client for the SheetSense backend.
 *
 * Automatically attaches the Supabase session JWT as a Bearer token.
 * Call apiGet / apiPost / apiPatch / apiDelete directly — they resolve
 * against the app's BASE_URL.
 *
 * 401 responses are treated as session expiry: the local session is cleared
 * and the user is redirected to /login.
 */
import { supabase } from "./supabase";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

/** Handle 401 by signing out and redirecting to /login */
async function handle401(res: Response): Promise<void> {
  if (res.status === 401) {
    await supabase.auth.signOut();
    window.location.href = `${BASE}/login`;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) {
    await handle401(res);
    throw new Error(`GET ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    await handle401(res);
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    await handle401(res);
    const text = await res.text();
    throw new Error(`PATCH ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, { method: "DELETE", headers });
  if (!res.ok) {
    await handle401(res);
    throw new Error(`DELETE ${path} → ${res.status}`);
  }
}
