import { resetItems, close } from "../src/db.js";

async function main() {
  const count = await resetItems();
  console.log(`Reset ${count} items to pending.`);
  await close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
