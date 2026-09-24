<<<<<<< HEAD
=======
import { Router, type IRouter } from "express";
import {
  RequestProductImageUploadUrlBody,
  RequestProductImageUploadUrlResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/firebase-auth";
import { createFirebaseUploadTarget } from "../lib/firebase-storage";

const router: IRouter = Router();

>>>>>>> 7cfb1fa (Update api-server routes and regenerate api-client-react schemas)
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
<<<<<<< HEAD
      const file = parsed.data.file;

      const target = await createFirebaseUploadTarget({
        folder: parsed.data.folder ?? "products",
        name: "upload",
        size: file.size,
        contentType: file.type,
=======
      const target = await createFirebaseUploadTarget({
        folder: parsed.data.folder ?? "products",
        name: parsed.data.name,
        size: parsed.data.size,
        contentType: parsed.data.contentType,
>>>>>>> 7cfb1fa (Update api-server routes and regenerate api-client-react schemas)
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
<<<<<<< HEAD
=======

export default router;
>>>>>>> 7cfb1fa (Update api-server routes and regenerate api-client-react schemas)
