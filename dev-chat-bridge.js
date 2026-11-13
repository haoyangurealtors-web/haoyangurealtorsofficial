// Only used by "npm run dev" on your laptop (it is not part of the live site).
// Vite alone does not run _worker.js, so without this the chat window would have nothing to talk to.
// This lets the dev server answer /api/chat by running the very same code the live site runs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function devChatApi(env) {
  const workerFile = path.resolve("_worker.js");
  return {
    name: "dev-chat-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        try {
          // Re-read the worker whenever the file changes, so edits show up without restarting.
          const version = fs.statSync(workerFile).mtimeMs;
          const worker = (await import(pathToFileURL(workerFile).href + "?v=" + version)).default;

          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const headers = new Headers();
          ["origin", "content-type", "user-agent"].forEach((name) => {
            if (typeof req.headers[name] === "string") headers.set(name, req.headers[name]);
          });
          const request = new Request("http://" + (req.headers.host || "localhost:5173") + "/api/chat", {
            method: req.method,
            headers,
            body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
          });
          const devEnv = {
            ...env,
            CHAT_RATE_LIMIT: env.CHAT_RATE_LIMIT || "1000", // no need to throttle yourself while testing
            ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
          };
          const response = await worker.fetch(request, devEnv, { waitUntil() {} });

          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          if (!response.body) return res.end();
          const reader = response.body.getReader();
          res.on("close", () => reader.cancel().catch(() => {}));
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            res.write(value);
          }
          return res.end();
        } catch (e) {
          console.error("dev chat bridge:", e && e.message ? e.message : e);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
          }
          return res.end(JSON.stringify({ error: "dev_bridge_failed" }));
        }
      });
    },
  };
}
