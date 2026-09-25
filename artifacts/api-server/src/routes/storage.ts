import { raw, Router, type IRouter } from "express";
import {
  RequestProductImageUploadUrlBody,
  RequestProductImageUploadUrlResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/firebase-auth";
import {
  createFirebaseReadUrl,
  createFirebaseUploadTarget,
  storeFirebaseImageUpload,
  verifyFirebaseImageUploadTicket,
} from "../lib/firebase-storage";

const router: IRouter = Router();
const imageContentTypes = ["image/jpeg", "image/png", "image/webp"];

router.get("/storage/read", async (req, res): Promise<void> => {
  const path = typeof req.query.path === "string" ? req.query.path : "";
  if (!path) {
    res.status(400).json({ error: "Image path is required" });
    return;
  }
  const url = await createFirebaseReadUrl(path);
  if (!url || url === path) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  res.redirect(url);
});

router.post(
  "/storage/uploads/request-url",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = RequestProductImageUploadUrlBody.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid upload metadata",
        details: parsed.error.flatten(),
      });
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
      req.log.warn(
        { err: error },
        "Failed to create Firebase upload target",
      );

      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare upload",
      });
    }
  },
);

router.put(
  "/storage/uploads/content",
  requireAdmin,
  raw({ type: imageContentTypes, limit: "10mb" }),
  async (req, res): Promise<void> => {
    const ticket = verifyFirebaseImageUploadTicket(req.get("x-upload-ticket"));
    if (!ticket) {
      res.status(403).json({ error: "This image upload has expired. Please choose the image again." });
      return;
    }

    const contentType = req.get("content-type")?.split(";")[0]?.trim() ?? "";
    if (!Buffer.isBuffer(req.body) || contentType !== ticket.contentType) {
      res.status(415).json({ error: "The uploaded file type did not match the selected image." });
      return;
    }

    try {
      const objectPath = await storeFirebaseImageUpload(ticket, contentType, req.body);
      res.status(201).json({ objectPath });
    } catch (error) {
      req.log.warn({ err: error }, "Failed to store Firebase image upload");
      const code =
        error && typeof error === "object" && "code" in error
          ? (error as { code?: unknown }).code
          : undefined;
      if (code === 412 || code === "412") {
        res.status(409).json({ error: "This image upload was already used. Please choose the image again." });
        return;
      }
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Unable to store the image in Firebase Storage.",
      });
    }
  },
);

export default router;
