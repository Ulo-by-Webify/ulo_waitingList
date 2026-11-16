import "server-only";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";

type Envelope<T> = { success: boolean; data: T | null; error: string | null };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<Envelope<T>>({ success: true, data, error: null }, { status });
}

export function fail(error: string, status: number) {
  return NextResponse.json<Envelope<null>>({ success: false, data: null, error }, { status });
}

export function validationError(error: ZodError) {
  const issue = error.issues[0];
  if (!issue) return fail("Invalid input", 400);
  // A root-level issue means readJson returned null: malformed JSON or a body over MAX_JSON_BYTES.
  if (issue.path.length === 0) return fail("Request body must be valid JSON (max 1 MB)", 400);
  const field = issue.path.join(".");
  return fail(field && issue.message === "Required" ? `${field} is required` : issue.message, 400);
}

export const unauthorized = () => fail("Unauthorized", 401);

/** Largest JSON body any endpoint accepts (a long journal post is well under this). */
export const MAX_JSON_BYTES = 1024 * 1024;

/**
 * Parses a JSON body, returning null for malformed or oversized input. Capping size here
 * bounds the work schema validation can be asked to do (e.g. huge arrays).
 */
export async function readJson(request: Request, maxBytes = MAX_JSON_BYTES): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Logs the detailed error server-side and returns a generic 500 to the client. */
export function serverError(context: string, error: unknown) {
  console.error(`[${context}]`, error);
  return fail("Something went wrong. Please try again.", 500);
}
