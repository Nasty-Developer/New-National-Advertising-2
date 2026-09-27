import { raw, Router, type IRouter } from "express";
import {
  RequestProductImageUploadUrlBody,
  RequestProductImageUploadUrlResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/firebase-auth";
import {
  createCloudinaryUploadTarget,
  uploadToCloudinary,
  verifyCloudinaryUploadTicket,
} from "../lib/cloudinary-storage";

const router: IRouter = Router();
const uploadContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

router.get("/storage/read", async (req, res): Promise<void> => {
  const path = typeof req.query.path === "string" ? req.query.path : "";
  if (!path) {
    res.status(400).json({ error: "Image path is required" });
    return;
  }
  if (/^https?:\/\//i.test(path)) {
    res.redirect(path);
    return;
  }
  const relativePath = path.startsWith("/") ? path : `/${path}`;
  if (!/^\/[a-zA-Z0-9._/-]+$/.test(relativePath)) {
    res.status(400).json({ error: "Invalid image path" });
    return;
  }
  res.redirect(relativePath);
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
      const target = createCloudinaryUploadTarget({
        folder: parsed.data.folder ?? "products",
        name: parsed.data.name,
        size: parsed.data.size,
        contentType: parsed.data.contentType,
      });

      res.json(RequestProductImageUploadUrlResponse.parse(target));
    } catch (error) {
      req.log.warn(
        { err: error },
        "Failed to create Cloudinary upload target",
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
  raw({ type: uploadContentTypes, limit: "10mb" }),
  async (req, res): Promise<void> => {
    const ticket = verifyCloudinaryUploadTicket(req.get("x-upload-ticket"));
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
      const objectPath = await uploadToCloudinary(ticket, contentType, req.body);
      res.status(201).json({ objectPath });
    } catch (error) {
      req.log.warn({ err: error }, "Failed to upload file to Cloudinary");
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload the file to Cloudinary.",
      });
    }
  },
);

export default router;
