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
app.use("/api", (req, res, next) => {
  const publicReadPaths = new Set([
    "/contact-numbers",
    "/machines",
    "/products",
    "/projects",
    "/services",
    "/settings",
    "/website-content",
  ]);
  if (req.method === "GET" && publicReadPaths.has(req.path)) {
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
  }
  next();
});
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
  app.use(
    express.static(frontendPath, {
      etag: true,
      maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
      setHeaders(res, filePath) {
        if (path.basename(filePath) === "index.html") {
          res.setHeader("Cache-Control", "no-cache");
          return;
        }
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable",
          );
          return;
        }
        if (/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(filePath)) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=2592000, stale-while-revalidate=86400",
          );
        }
      },
    }),
  );
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
