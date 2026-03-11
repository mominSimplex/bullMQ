import { addJob, close } from "../src/bullMQ/producer.js";

const failAtChunk =
  process.argv[2] !== undefined ? parseInt(process.argv[2], 10) : null;
const chunkSize = parseInt(process.env.CHUNK_SIZE ?? "50", 10);

async function main() {
  const job = await addJob({ chunkSize, failAtChunk });
  console.log("Enqueued job:", job.id, job.name);
  if (failAtChunk != null) {
    console.log("Will simulate failure at chunk index:", failAtChunk);
  }
  await close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
