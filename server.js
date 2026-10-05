// Entry point for TechNE's Passenger-managed "Node.js App" panel, which
// runs `node server.js` directly and expects the app to listen on
// process.env.PORT — `next start` alone doesn't fit that contract, since
// Passenger never invokes it and needs a plain http.Server to hand
// requests to.
const { createServer } = require("http");
const next = require("next");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const dev = process.env.NODE_ENV === "development";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;
const host = process.env.BIND_HOST || "127.0.0.1";

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, host, () => {
    console.log(`Glitz Africa frontend ready at ${host}:${port} (${dev ? "development" : "production"})`);
  });
}).catch((error) => {
  console.error("Glitz Africa frontend failed to start", error);
  process.exit(1);
});
