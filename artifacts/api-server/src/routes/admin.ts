import { Router, type IRouter } from "express";
import { GetAdminSessionResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/session", (req, res): void => {
  if (req.signedCookies?.admin_session !== "authenticated") {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  res.json(GetAdminSessionResponse.parse({ authenticated: true }));
});

export default router;