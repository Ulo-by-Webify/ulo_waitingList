import "server-only";
import { getPool } from "./db";
import type { NewsletterInput, UserType, WaitlistInput } from "@/lib/validation";

export type Signup = {
  id: string;
  fullName: string;
  email: string;
  country: string;
  userType: UserType;
  createdAt: string;
};

export type Subscriber = { id: string; email: string; createdAt: string };

export type Page<T> = { rows: T[]; total: number; page: number; pageSize: number };

export type SignupFilters = { search?: string; userType?: UserType; page?: number; pageSize?: number };

export type DashboardStats = {
  totalSignups: number;
  last7Days: number;
  byType: Record<UserType, number>;
  topCountries: { country: string; count: number }[];
  subscribers: number;
};

const DEFAULT_PAGE_SIZE = 25;

function toSignup(row: Record<string, unknown>): Signup {
  return {
    id: String(row.id),
    fullName: row.full_name as string,
    email: row.email as string,
    country: row.country as string,
    userType: row.user_type as UserType,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

/** Returns true when a new row was created, false if the email already existed. */
export async function createSignup(input: WaitlistInput): Promise<boolean> {
  const result = await getPool().query(
    `INSERT INTO waitlist_signups (full_name, email, country, user_type)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (lower(email)) DO NOTHING`,
    [input.fullName, input.email, input.country, input.userType],
  );
  return result.rowCount === 1;
}

export async function createSubscriber(input: NewsletterInput): Promise<boolean> {
  const result = await getPool().query(
    `INSERT INTO newsletter_subscribers (email) VALUES ($1)
     ON CONFLICT (lower(email)) DO NOTHING`,
    [input.email],
  );
  return result.rowCount === 1;
}

function buildSignupWhere(filters: SignupFilters): { clause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR country ILIKE $${params.length})`);
  }
  if (filters.userType) {
    params.push(filters.userType);
    conditions.push(`user_type = $${params.length}`);
  }
  return { clause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "", params };
}

export async function listSignups(filters: SignupFilters): Promise<Page<Signup>> {
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const { clause, params } = buildSignupWhere(filters);

  const [rows, count] = await Promise.all([
    getPool().query(
      `SELECT * FROM waitlist_signups ${clause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, (page - 1) * pageSize],
    ),
    getPool().query(`SELECT count(*)::int AS total FROM waitlist_signups ${clause}`, params),
  ]);

  return { rows: rows.rows.map(toSignup), total: count.rows[0].total, page, pageSize };
}

export async function listAllSignups(filters: SignupFilters): Promise<Signup[]> {
  const { clause, params } = buildSignupWhere(filters);
  const result = await getPool().query(
    `SELECT * FROM waitlist_signups ${clause} ORDER BY created_at DESC`,
    params,
  );
  return result.rows.map(toSignup);
}

export async function listSubscribers(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<Page<Subscriber>> {
  const safePage = Math.max(1, page);
  const [rows, count] = await Promise.all([
    getPool().query(
      `SELECT id, email, created_at FROM newsletter_subscribers
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [pageSize, (safePage - 1) * pageSize],
    ),
    getPool().query(`SELECT count(*)::int AS total FROM newsletter_subscribers`),
  ]);
  return {
    rows: rows.rows.map((r) => ({ id: String(r.id), email: r.email, createdAt: r.created_at.toISOString() })),
    total: count.rows[0].total,
    page: safePage,
    pageSize,
  };
}

export async function listAllSubscribers(): Promise<Subscriber[]> {
  const result = await getPool().query(
    `SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC`,
  );
  return result.rows.map((r) => ({ id: String(r.id), email: r.email, createdAt: r.created_at.toISOString() }));
}

export async function deleteSignup(id: string): Promise<boolean> {
  const result = await getPool().query(`DELETE FROM waitlist_signups WHERE id = $1`, [id]);
  return result.rowCount === 1;
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  const result = await getPool().query(`DELETE FROM newsletter_subscribers WHERE id = $1`, [id]);
  return result.rowCount === 1;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const pool = getPool();
  const [totals, byType, countries, subscribers] = await Promise.all([
    pool.query(
      `SELECT count(*)::int AS total,
              count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS last7
       FROM waitlist_signups`,
    ),
    pool.query(`SELECT user_type, count(*)::int AS count FROM waitlist_signups GROUP BY user_type`),
    pool.query(
      `SELECT country, count(*)::int AS count FROM waitlist_signups
       GROUP BY country ORDER BY count DESC LIMIT 5`,
    ),
    pool.query(`SELECT count(*)::int AS total FROM newsletter_subscribers`),
  ]);

  const typeCounts = Object.fromEntries(byType.rows.map((r) => [r.user_type, r.count]));
  return {
    totalSignups: totals.rows[0].total,
    last7Days: totals.rows[0].last7,
    byType: { guest: typeCounts.guest ?? 0, host: typeCounts.host ?? 0, associate: typeCounts.associate ?? 0 },
    topCountries: countries.rows,
    subscribers: subscribers.rows[0].total,
  };
}
