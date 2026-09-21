import { Router, type IRouter } from "express";
import {
  RequestProductImageUploadUrlBody,
  RequestProductImageUploadUrlResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "./admin";
import { createFirebaseReadUrl, createFirebaseUploadTarget } from "../lib/firebase-storage";

const router: IRouter = Router();

router.post("/storage/uploads/request-url", requireAdmin, async (req, res): Promise<void> => {
  const parsed = RequestProductImageUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid upload metadata", details: parsed.error.flatten() });
    return;
  }

  try {
    const target = await createFirebaseUploadTarget({
      folder: parsed.data.folder ?? "products",
      name: parsed.data.name,
      size: parsed.data.size,
      contentType: parsed.data.contentType,
    });
    res.json(RequestProductImageUploadUrlResponse.parse(target));
  } catch (error) {
    req.log.warn({ err: error }, "Failed to create Firebase upload target");
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to prepare upload" });
  }
});

router.get("/storage/objects/*path", async (req, res): Promise<void> => {
  const rawPath = req.params.path;
  const objectPath = Array.isArray(rawPath) ? rawPath.join("/") : rawPath;
  try {
    const url = await createFirebaseReadUrl(objectPath);
    if (!url) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    res.redirect(url);
  } catch (error) {
    req.log.warn({ err: error }, "Failed to create Firebase file URL");
    res.status(404).json({ error: "File not found" });
  }
});

export default router;