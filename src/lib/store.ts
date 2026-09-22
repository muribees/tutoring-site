// Testimonial storage. Uses Upstash Redis (through its REST API) when the
// KV_REST_API_* or UPSTASH_REDIS_REST_* env vars are set, which is what the
// Upstash integration on Vercel adds. Local dev without them uses memory.

export const ROLES = ["Student", "Parent", "Teacher", "Other"] as const;
export const SUBJECTS = ["Math", "Spanish", "Computer Science", "Other"] as const;

export type Status = "pending" | "approved";

export type Testimonial = {
  id: string;
  name: string;
  role: (typeof ROLES)[number];
  subject: (typeof SUBJECTS)[number];
  message: string;
  createdAt: string;
  status: Status;
};

export class StoreNotConfigured extends Error {
  constructor() {
    super(
      "Testimonial storage isn't connected. Add an Upstash Redis database to the Vercel project.",
    );
  }
}

const KEY = "tutoring:testimonials";
const RATE_LIMIT = 5; // submissions per IP per hour

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

type MemoryStore = {
  rows: Map<string, string>;
  rates: Map<string, { count: number; resetAt: number }>;
};
const g = globalThis as unknown as { __tutoringStore?: MemoryStore };

function memory(): MemoryStore | null {
  if (REST_URL && REST_TOKEN) return null;
  if (process.env.NODE_ENV === "production") throw new StoreNotConfigured();
  g.__tutoringStore ??= { rows: new Map(), rates: new Map() };
  return g.__tutoringStore;
}

async function redis(commands: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis request failed (${res.status})`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  for (const r of out) if (r.error) throw new Error(r.error);
  return out.map((r) => r.result);
}

async function readAll(): Promise<Testimonial[]> {
  const mem = memory();
  let raw: string[];
  if (mem) {
    raw = [...mem.rows.values()];
  } else {
    const [flat] = (await redis([["HGETALL", KEY]])) as [string[]];
    raw = flat.filter((_, i) => i % 2 === 1);
  }
  return raw
    .map((r) => JSON.parse(r) as Testimonial)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function write(t: Testimonial) {
  const mem = memory();
  if (mem) mem.rows.set(t.id, JSON.stringify(t));
  else await redis([["HSET", KEY, t.id, JSON.stringify(t)]]);
}

export async function listApproved() {
  return (await readAll()).filter((t) => t.status === "approved");
}

export async function listAll() {
  return readAll();
}

export async function addPending(
  input: Pick<Testimonial, "name" | "role" | "subject" | "message">,
) {
  const t: Testimonial = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  await write(t);
  return t;
}

export async function setStatus(id: string, status: Status) {
  const mem = memory();
  const raw = mem
    ? mem.rows.get(id)
    : ((await redis([["HGET", KEY, id]]))[0] as string | null);
  if (!raw) return false;
  await write({ ...(JSON.parse(raw) as Testimonial), status });
  return true;
}

export async function remove(id: string) {
  const mem = memory();
  if (mem) mem.rows.delete(id);
  else await redis([["HDEL", KEY, id]]);
}

export async function allowSubmission(ip: string) {
  const mem = memory();
  if (mem) {
    const now = Date.now();
    const entry = mem.rates.get(ip);
    if (!entry || entry.resetAt < now) {
      mem.rates.set(ip, { count: 1, resetAt: now + 3_600_000 });
      return true;
    }
    entry.count++;
    return entry.count <= RATE_LIMIT;
  }
  const key = `tutoring:rate:${ip}`;
  const [count] = (await redis([
    ["INCR", key],
    ["EXPIRE", key, 3600, "NX"],
  ])) as [number];
  return count <= RATE_LIMIT;
}
