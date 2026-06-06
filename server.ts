import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./src/server/routes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Core Request Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API Endpoints FIRST
  app.use("/api", apiRouter);

  // Health endpoint for infrastructure checks
  app.get("/api/health", (req, res) => {
    res.json({ site: "ARA Mart Server", status: "active", uptime: process.uptime() });
  });

  // Integrate Vite Development Middleware or Static Production Asset Handlers
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[ARA Mart] Development mode active. Mounted Vite middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[ARA Mart] Production mode active. Serving compiled static distribution assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ARA Mart Backend Server] Listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical failure during full-stack server bootstrap", err);
});
