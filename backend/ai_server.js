/**
 * server.js (or app.js)
 * Drop-in patch for OSSFinder backend to add the AI Project Builder route.
 * 
 * If you already have an Express app, just copy the relevant lines
 * (marked with ← ADD THIS) into your existing server file.
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// ─── Existing routes (keep yours here) ───────────────────────────────────────
// app.use("/api/auth", authRouter);
// app.use("/api/bookmarks", bookmarkRouter);
// ... your existing routes ...

// ─── ← ADD THIS: AI Project Builder route ─────────────────────────────────
const projectBuilderRouter = require("./routes/projectBuilder");
app.use("/api/project-builder", projectBuilderRouter);
// ─────────────────────────────────────────────────────────────────────────────

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ossfinder-api",
    features: ["project-builder-agent"],
    timestamp: new Date().toISOString(),
  });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`OSSFinder API running on port ${PORT}`);
  console.log(`AI Project Builder: http://localhost:${PORT}/api/project-builder`);
});

module.exports = app;
