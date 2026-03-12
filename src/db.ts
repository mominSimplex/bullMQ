import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/bullmq_demo";
const pool = new Pool({ connectionString });

export interface ItemRow {
  id: number;
  data: string | null;
  status: string;
  processed_at: Date | null;
  created_at: Date | null;
}

export async function createTable(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        data TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_items_id ON items (id)
    `);
  } finally {
    client.release();
  }
}

export async function getNextChunk(
  lastProcessedId: number,
  chunkSize: number
): Promise<ItemRow[]> {
  const result = await pool.query<ItemRow>(
    `SELECT id, data, status, processed_at, created_at
     FROM items
     WHERE id > $1
     ORDER BY id
     LIMIT $2`,
    [lastProcessedId, chunkSize]
  );
  return result.rows;
}

export async function processChunk(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await pool.query(
    `UPDATE items
     SET status = 'processed', processed_at = NOW()
     WHERE id = ANY($1::int[])`,
    [ids]
  );
}

export async function seed(count: number): Promise<void> {
  const client = await pool.connect();
  try {
    const values: string[] = [];
    const args: (string | number)[] = [];
    for (let i = 0; i < count; i++) {
      args.push(`item-${i + 1}`, "pending");
      values.push(`($${i * 2 + 1}, $${i * 2 + 2})`);
    }
    await client.query(
      `INSERT INTO items (data, status) VALUES ${values.join(", ")}`,
      args
    );
  } finally {
    client.release();
  }
}

export async function resetItems(): Promise<number> {
  const result = await pool.query(
    `UPDATE items SET status = 'pending', processed_at = NULL`
  );
  return result.rowCount ?? 0;
}

export async function close(): Promise<void> {
  await pool.end();
}

export { pool };
