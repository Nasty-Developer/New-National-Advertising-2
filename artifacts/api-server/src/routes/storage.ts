import { Readable } from "node:stream";
import { Router, type IRouter } from "express";
import {
  RequestProductImageUploadUrlBody,
  RequestProductImageUploadUrlResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "./admin";
import { createUploadTarget, getObjectFile, ObjectNotFoundError, streamObject } from "../lib/objectStorage";

const router: IRouter = Router();

router.post("/storage/uploads/request-url", requireAdmin, async (req, res): Promise<void> => {
  const parsed = RequestProductImageUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid image metadata" });
    return;
  }

  try {
    const target = await createUploadTarget();
    res.json(RequestProductImageUploadUrlResponse.parse(target));
  } catch (error) {
    req.log.error({ err: error }, "Failed to create image upload target");
    res.status(500).json({ error: "Unable to prepare image upload" });
  }
});

router.get("/storage/objects/*path", async (req, res): Promise<void> => {
  try {
    const rawPath = req.params.path;
    const objectPath = `/objects/${Array.isArray(rawPath) ? rawPath.join("/") : rawPath}`;
    const response = await streamObject(await getObjectFile(objectPath));
    for (const [key, value] of Object.entries(response.headers)) res.setHeader(key, value);
    Readable.fromWeb(response.stream as ReadableStream<Uint8Array>).pipe(res);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Image not found" });
      return;
    }
    req.log.error({ err: error }, "Failed to serve object");
    res.status(500).json({ error: "Unable to serve image" });
  }
});

export default router;