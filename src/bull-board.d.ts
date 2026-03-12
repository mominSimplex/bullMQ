declare module "@bull-board/api" {
  export function createBullBoard(options: {
    queues: readonly unknown[];
    serverAdapter: unknown;
    options?: { uiConfig?: object; uiBasePath?: string };
  }): {
    setQueues: (queues: readonly unknown[]) => void;
    replaceQueues: (queues: readonly unknown[]) => void;
    addQueue: (queue: unknown) => void;
    removeQueue: (queueOrName: string | unknown) => void;
  };
}

declare module "@bull-board/api/bullMQAdapter.js" {
  import type { Queue } from "bullmq";
  export class BullMQAdapter {
    constructor(queue: Queue, options?: object);
  }
}

declare module "@bull-board/express" {
  export class ExpressAdapter {
    setBasePath(path: string): ExpressAdapter;
    getRouter(): import("express").Router;
  }
}
