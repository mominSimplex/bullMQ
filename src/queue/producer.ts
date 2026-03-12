import queue from "./queue.js";

export type AddJobData = {
  batchId?: string;
  chunkSize?: number;
  lastProcessedId?: number;
  failAtChunk?: number | null;
};

const JOB_NAME = "process-chunks";

export async function addJob(options: AddJobData = {}) {
  const {
    batchId = `batch-${Date.now()}`,
    chunkSize = 50,
    lastProcessedId = 0,
    failAtChunk = null,
  } = options;

  const job = await queue.add(
    JOB_NAME,
    {
      batchId,
      chunkSize,
      lastProcessedId,
      failAtChunk,
    },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: false,
    }
  );
  return job;
}

export async function close() {
  await queue.close();
}
