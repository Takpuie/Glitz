// Entry point for TechNE's Passenger-managed "Node.js App" panel, which
// runs `node server.js` directly and expects the app to listen on
// process.env.PORT — `next start` alone doesn't fit that contract, since
// Passenger never invokes it and needs a plain http.Server to hand
// requests to.
const { loadEnvConfig } = require("@next/env");
const { startServer } = require("next/dist/server/lib/start-server");

loadEnvConfig(process.cwd());

const dev = process.env.NODE_ENV === "development";
const port = Number(process.env.PORT || 3000);
const host = process.env.BIND_HOST || "127.0.0.1";

startServer({
  dir: process.cwd(),
  isDev: dev,
  hostname: host,
  port,
  allowRetry: false,
}).catch((error) => {
  console.error("Glitz Africa frontend failed to start", error);
  process.exit(1);
});
