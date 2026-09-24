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
      const file = parsed.data.file;

      const target = await createFirebaseUploadTarget({
        folder: parsed.data.folder ?? "products",
        name: "upload",
        size: file.size,
        contentType: file.type,
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
