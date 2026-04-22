import serverless from "serverless-http";
import type { Handler } from "@netlify/functions";
import { createApp } from "../../server/app";

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app, {
      basePath: "/.netlify/functions/api",
    });
  }
  return cachedHandler;
}

export const handler: Handler = async (event, context) => {
  const h = await getHandler();
  return (await h(event as any, context as any)) as any;
};
