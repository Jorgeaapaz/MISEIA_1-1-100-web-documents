import { MongoClient, ObjectId } from "mongodb";
import { performance } from "node:perf_hooks";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const DB_NAME = "benchmark-web-documents";
const COLLECTION = "documents";
const N_DOCS = 1000;
const N_QUERIES = 100;
const FILE_TYPES = ["pdf", "video", "audio", "image", "office"] as const;

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return Math.round(sorted[Math.max(0, idx)]);
}

async function timeQuery(
  col: ReturnType<ReturnType<MongoClient["db"]>["collection"]>,
  n: number
): Promise<{ p50: number; p95: number; p99: number }> {
  const timings: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = performance.now();
    await col.find({ type: "pdf" }).toArray();
    timings.push(performance.now() - t0);
  }
  timings.sort((a, b) => a - b);
  return {
    p50: percentile(timings, 50),
    p95: percentile(timings, 95),
    p99: percentile(timings, 99),
  };
}

async function runBenchmark() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);

    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    // Clean up from any previous run
    await col.drop().catch(() => null);

    // Insert N_DOCS test documents
    console.log(`\nInserting ${N_DOCS} test documents...`);
    const docs = Array.from({ length: N_DOCS }, (_, i) => ({
      _id: new ObjectId(),
      title: `Test Document ${i}`,
      type: FILE_TYPES[i % FILE_TYPES.length],
      size: Math.floor(Math.random() * 10_000_000),
      uploadedBy: new ObjectId(),
      createdAt: new Date(Date.now() - i * 60_000),
      tags: [`tag${i % 10}`],
    }));
    await col.insertMany(docs);
    console.log(`Inserted ${N_DOCS} documents.`);

    // Ensure no index (besides _id) exists
    await col.dropIndexes().catch(() => null);

    // ── Baseline: no index ────────────────────────────────────────────────────
    console.log(`\nRunning ${N_QUERIES} queries WITHOUT index...`);
    const withoutIndex = await timeQuery(col, N_QUERIES);
    console.log("WITHOUT index:", withoutIndex);

    // ── Create compound index ─────────────────────────────────────────────────
    console.log("\nCreating compound index { type: 1, createdAt: -1 }...");
    await col.createIndex({ type: 1, createdAt: -1 });
    console.log("Index created.");

    // ── With index ────────────────────────────────────────────────────────────
    console.log(`\nRunning ${N_QUERIES} queries WITH index...`);
    const withIndex = await timeQuery(col, N_QUERIES);
    console.log("WITH index:", withIndex);

    // ── Results ───────────────────────────────────────────────────────────────
    const improvement = (withoutIndex.p50 / withIndex.p50).toFixed(1);
    console.log("\n── Benchmark Results ──────────────────────────────────────");
    console.log(`Setup: ${N_DOCS} documents, find({ type: 'pdf' }), ${N_QUERIES} iterations`);
    console.log(
      JSON.stringify(
        {
          setup: { documents: N_DOCS, queries: N_QUERIES, filter: "type=pdf" },
          withoutIndex,
          withIndex,
          improvementAtP50: `${improvement}x`,
        },
        null,
        2
      )
    );

    // Clean up
    await db.dropDatabase();
    console.log("\nTest database dropped. Benchmark complete.");
  } finally {
    await client.close();
  }
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err.message);
  process.exit(1);
});
