import "dotenv/config";
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import queue from "./bullMQ/queue.js";

const PORT = parseInt(process.env.DASHBOARD_PORT ?? "3000", 10);
const BASE_PATH = "/admin/queues";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath(BASE_PATH);

createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter,
});

const app = express();
app.use(BASE_PATH, serverAdapter.getRouter());

app.get("/", (_req, res) => {
  res.redirect(BASE_PATH);
});

app.listen(PORT, () => {
  console.log(`Bull Board dashboard: http://localhost:${PORT}${BASE_PATH}`);
});
