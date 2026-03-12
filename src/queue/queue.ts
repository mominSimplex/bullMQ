import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const queue = new Queue("db-processing-queue", {
  connection: { url: redisUrl },
});
export default queue;