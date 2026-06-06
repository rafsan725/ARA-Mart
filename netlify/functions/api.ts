import express from "express";
import serverless from "serverless-http";
import { apiRouter } from "../../src/server/routes.js";

const app = express();

// Parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Mount router on multiple potential paths to ensure seamless routing in all Netlify configurations
app.use("/api", apiRouter);
app.use("/.netlify/functions/api", apiRouter);
app.use("/", apiRouter);

export const handler = serverless(app);
