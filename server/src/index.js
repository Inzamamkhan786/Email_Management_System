import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectMongo } from "./config/db.js";
import { loadStore, getState, setState } from "./store/fileStore.js";
import { buildSeed } from "./seed/sample.js";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "MailPilot", store: "file", time: new Date().toISOString() });
});

app.use("/api", routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
});

async function start() {
  loadStore();
  const useFile = process.env.USE_FILE_STORE !== "false";
  if (!useFile) {
    await connectMongo(process.env.MONGO_URI);
  }
  if (getState().users.length === 0) {
    setState(buildSeed());
    console.log("Loaded demo seed data.");
  }
  app.listen(PORT, () => {
    console.log(`MailPilot API on http://localhost:${PORT}`);
  });
}

start();
