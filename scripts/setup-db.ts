import { createTable, close } from "../src/db.js";

async function main() {
  await createTable();
  console.log('Table "items" created.');
  await close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
