// Entry point for TechNE's Passenger-managed "Node.js App" panel, which
// runs `node server.js` directly and expects the app to listen on
// process.env.PORT — `next start` alone doesn't fit that contract, since
// Passenger never invokes it and needs a plain http.Server to hand
// requests to.
const { loadEnvConfig } = require("@next/env");
const { startServer } = require("next/dist/server/lib/start-server");

loadEnvConfig(__dirname);

const dev = process.env.NODE_ENV === "development";
// TechNE assigns each Node instance a private listener port. Its public
// IP/domain mapping forwards traffic to this port.
const port = Number(process.env.NODE_PORT || 25973);
const host = process.env.NODE_HOST || "0.0.0.0";

startServer({
  dir: __dirname,
  isDev: dev,
  hostname: host,
  port,
  allowRetry: false,
}).catch((error) => {
  console.error("Glitz Africa frontend failed to start", error);
  process.exit(1);
});
