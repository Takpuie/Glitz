// Entry point for TechNE's Passenger-managed "Node.js App" panel, which
// runs `node server.js` directly and expects the app to listen on
// process.env.PORT — `next start` alone doesn't fit that contract, since
// Passenger never invokes it and needs a plain http.Server to hand
// requests to.
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV === "development";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Glitz Africa frontend ready on port ${port} (${dev ? "development" : "production"})`);
  });
});
