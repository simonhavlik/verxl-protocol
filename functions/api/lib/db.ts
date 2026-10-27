import pg from "pg";

const { Client } = pg;

// Charizard PostgreSQL Configuration (strictly isolated to 'verxl' schema)
// Used across Verxl Protocol for non-custodial user balances, api keys, deposits, and usage records.
export const DB_CONNECTION_STRING =
  "postgresql://***REMOVED***";

let _env: any = null;

export function setDbEnv(env: any) {
  if (env) _env = env;
}

export function createPgClient(connStr?: string): pg.Client {
  const hyperdriveStr = _env?.HYPERDRIVE?.connectionString;
  const isHyperdrive = Boolean(hyperdriveStr && !connStr);
  const targetStr = connStr || hyperdriveStr || DB_CONNECTION_STRING;

  return new Client({
    connectionString: targetStr,
    ssl: isHyperdrive
      ? false
      : {
          rejectUnauthorized: false,
        },
    connectionTimeoutMillis: 7000,
  });
}

/**
 * Execute a query against Charizard PostgreSQL in schema 'verxl'.
 * Ensures zero interference with any 'public.*' tables used by other apps.
 */
export async function queryPg<T = any>(
  sql: string,
  params: any[] = [],
  customConnStr?: string
): Promise<T[]> {
  const client = createPgClient(customConnStr);
  await client.connect();
  try {
    await client.query("SET search_path TO verxl, public;");
    const res = await client.query(sql, params);
    return res.rows as T[];
  } finally {
    try {
      await client.end();
    } catch {
      // ignore close errors
    }
  }
}

/**
 * Execute a mutation query (INSERT, UPDATE, DELETE) against Charizard PostgreSQL.
 */
export async function execPg(
  sql: string,
  params: any[] = [],
  customConnStr?: string
): Promise<{ rowCount: number }> {
  const client = createPgClient(customConnStr);
  await client.connect();
  try {
    await client.query("SET search_path TO verxl, public;");
    const res = await client.query(sql, params);
    return { rowCount: res.rowCount ?? 0 };
  } finally {
    try {
      await client.end();
    } catch {
      // ignore close errors
    }
  }
}

/**
 * Normalizes SQL queries:
 * 1. Converts ? parameter placeholders to PostgreSQL $1, $2, ...
 * 2. Converts SQLite datetime('now') to PostgreSQL CURRENT_TIMESTAMP
 * 3. Rewrites unqualified table references to explicit 'verxl.<table_name>'
 *    to guarantee 100% data isolation from public tables.
 */
export function normalizeSqlForPostgres(sql: string): string {
  let paramIndex = 1;
  let out = sql.replace(/\?/g, () => `$${paramIndex++}`);
  out = out.replace(/datetime\('now'\)/gi, "CURRENT_TIMESTAMP");

  // Explicitly qualify verxl tables if they are referenced without schema
  const knownTables = [
    "users",
    "api_keys",
    "auth_codes",
    "deposits",
    "providers",
    "payout_requests",
    "usage_records",
    "proposals",
    "dao_stats",
    "votes",
    "sync_logs",
  ];

  for (const table of knownTables) {
    // Replace whole word table names that are not already preceded by verxl.
    const regex = new RegExp(`(?<!verxl\\.)\\b${table}\\b`, "gi");
    out = out.replace(regex, `verxl.${table}`);
  }

  return out;
}

/**
 * Clean, drop-in replacement for the old Cloudflare D1 interface.
 * Strictly executes on Charizard PostgreSQL (schema: verxl) with zero SQLite / D1 overhead.
 */
export const db = {
  prepare(sql: string) {
    const pgSql = normalizeSqlForPostgres(sql);

    const makeRunner = (params: any[]) => ({
      async first<T = any>(): Promise<T | null> {
        const rows = await queryPg<T>(pgSql, params);
        return rows.length > 0 ? rows[0] : null;
      },
      async all<T = any>(): Promise<{ results: T[] }> {
        const results = await queryPg<T>(pgSql, params);
        return { results };
      },
      async run(): Promise<{ success: boolean; changes: number }> {
        const res = await execPg(pgSql, params);
        return { success: true, changes: res.rowCount };
      },
    });

    return {
      bind(...params: any[]) {
        return makeRunner(params);
      },
      ...makeRunner([]),
    };
  },
};
