import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { existsSync } from "node:fs";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API
app.use("/api", router);

// Frontend
const localFrontendPath = path.resolve(
  process.cwd(),
  "../new-national-advertising/dist/public",
);
const workspaceFrontendPath = path.resolve(
  process.cwd(),
  "artifacts/new-national-advertising/dist/public",
);

const frontendPath = existsSync(localFrontendPath)
  ? localFrontendPath
  : workspaceFrontendPath;

const frontendIndexPath = path.join(frontendPath, "index.html");

if (existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

// React SPA fallback
app.use((req, res, next) => {
  if (req.path === "/api" || req.path.startsWith("/api/")) {
    return next();
  }

  if (
    (req.method === "GET" || req.method === "HEAD") &&
    existsSync(frontendIndexPath)
  ) {
    return res.sendFile(frontendIndexPath);
  }

  next();
});

export default app;
