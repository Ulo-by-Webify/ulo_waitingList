// All database primary keys are UUIDs. Validate route/token ids before they reach a query,
// so malformed input is a clean 400/404 instead of a Postgres cast error.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | undefined | null): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
