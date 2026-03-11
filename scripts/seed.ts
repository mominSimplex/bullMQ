import { createTable, seed, close } from "../src/db.js";

const count = parseInt(process.env.SEED_COUNT ?? "200", 10);

async function main() {
  await createTable();
  await seed(count);
  console.log(`Seeded ${count} items.`);
  await close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
