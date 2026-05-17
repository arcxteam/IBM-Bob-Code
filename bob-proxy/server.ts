import express from "express";
import cors from "cors";
import { runBobShell, SESSIONS_DIR, LOG_FILE } from "./bob-runner.js";

const app = express();
const PORT = process.env.BOB_PROXY_PORT || 3003;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

interface BobRequest {
  prompt: string;
  chatMode?: "advanced" | "code" | "ask" | "plan";
  maxCoins?: number;
  approvalMode?: "default" | "auto_edit" | "yolo";
}

app.post("/api/bob", (req, res) => {
  const { prompt, chatMode, maxCoins, approvalMode } = req.body as BobRequest;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  if (prompt.length > 50000) {
    return res.status(400).json({ error: "prompt too long (max 50KB)" });
  }

  console.log(`[BOB-PROXY] Request: ${prompt.slice(0, 100)}...`);

  const result = runBobShell(prompt, {
    chatMode: chatMode || "advanced",
    maxCoins: maxCoins || 3,
    approvalMode: approvalMode || "default",
    timeout: 90000,
  });

  if (result.success) {
    return res.json({
      success: true,
      output: result.output,
      sessionId: result.sessionId,
      duration: result.duration,
      fallback: false,
    });
  }

  return res.json({
    success: false,
    output: "",
    error: result.error,
    sessionId: result.sessionId,
    duration: result.duration,
    fallback: true,
  });
});

app.get("/api/bob/health", (_req, res) => {
  res.json({
    status: "ok",
    proxy: "running",
    port: PORT,
    sessionsDir: SESSIONS_DIR,
    logFile: LOG_FILE,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/bob/sessions", (_req, res) => {
  const fs = require("fs");
  const path = require("path");
  try {
    const files = fs.readdirSync(SESSIONS_DIR).filter((f: string) => f.endsWith(".json"));
    const sessions = files.slice(-20).map((f: string) => {
      const data = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, f), "utf-8"));
      return { id: data.sessionId, success: data.success, duration: data.duration, fallback: data.fallback };
    });
    res.json({ count: files.length, recent: sessions });
  } catch {
    res.json({ count: 0, recent: [] });
  }
});

app.listen(PORT, () => {
  console.log(`[BOB-PROXY] Running on port ${PORT}`);
  console.log(`[BOB-PROXY] Sessions: ${SESSIONS_DIR}`);
  console.log(`[BOB-PROXY] Health: http://localhost:${PORT}/api/bob/health`);
});
