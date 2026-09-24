import { Router, type IRouter } from "express";
import {
  RequestProductImageUploadUrlBody,
  RequestProductImageUploadUrlResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/firebase-auth";
import { createFirebaseUploadTarget } from "../lib/firebase-storage";

const router: IRouter = Router();

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

export default router;
