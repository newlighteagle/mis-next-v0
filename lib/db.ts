import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } =
    process.env as Record<string, string | undefined>;

  if (DATABASE_URL) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  } else {
    if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
      throw new Error(
        "Database env vars missing: set DATABASE_URL or PGHOST, PGDATABASE, PGUSER, PGPASSWORD"
      );
    }
    pool = new Pool({
      host: PGHOST,
      database: PGDATABASE,
      user: PGUSER,
      password: PGPASSWORD,
      port: PGPORT ? parseInt(PGPORT, 10) : 5432,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }

  return pool;
}

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(text, params);
    return result;
  } finally {
    client.release();
  }
}

export type MainDashboardRow = {
  name: string;
  region: string;
  farmers: number;
  trained: number;
  certified: number;
};
