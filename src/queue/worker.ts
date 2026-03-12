import { Worker, Job } from "bullmq";
import { getNextChunk, processChunk } from "../db.js";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const QUEUE_NAME = "db-processing-queue";

type ProcessChunksData = {
  batchId: string;
  chunkSize: number;
  lastProcessedId: number;
  failAtChunk: number | null;
};

let chunkIndex = 0;

async function processJob(job: Job<ProcessChunksData>) {
  const { batchId, chunkSize, lastProcessedId, failAtChunk } = job.data;
  let currentLastId = lastProcessedId ?? 0;

  while (true) {
    const rows = await getNextChunk(currentLastId, chunkSize);
    if (rows.length === 0) {
      console.log(`[${batchId}] No more chunks. Done.`);
      return { completed: true, lastProcessedId: currentLastId };
    }

    const ids = rows.map((r) => r.id);
    const nextLastId = ids[ids.length - 1]!;

    if (failAtChunk != null && chunkIndex === failAtChunk) {
      console.log(
        `[${batchId}] failure at chunk index ${chunkIndex} (ids ${ids[0]}-${nextLastId})`
      );
      throw new Error(`Demo failure at chunk ${chunkIndex}`);
    }

    await processChunk(ids);
    chunkIndex += 1;
    console.log(
      `[${batchId}] Processed chunk: ids ${ids[0]}-${nextLastId} (${rows.length} rows)`
    );

    currentLastId = nextLastId;
    await job.updateData({
      ...job.data,
      lastProcessedId: currentLastId,
    });
  }
}

const worker = new Worker<ProcessChunksData>(
  QUEUE_NAME,
  processJob,
  {
    connection: { url: redisUrl },
    concurrency: 1,
  }
);

worker.on("completed", () => {
  chunkIndex = 0;
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed: ${err.message}. Will retry from checkpoint.`);
  chunkIndex = 0;
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

console.log("Worker started. Waiting for jobs...");

export default worker;
