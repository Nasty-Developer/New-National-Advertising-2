import { Router, type IRouter } from "express";
import { AdminLoginResponse, AdminLogoutResponse, GetAdminSessionResponse } from "@workspace/api-zod";
import { requireAdmin } from "../lib/firebase-auth";

const router: IRouter = Router();

router.get("/admin/session", requireAdmin, (_req, res): void => {
  res.json(GetAdminSessionResponse.parse({ authenticated: true }));
});

// Kept for API compatibility. Firebase Authentication performs the credential
// exchange in the browser; this endpoint verifies the resulting bearer token.
router.post("/admin/login", requireAdmin, (_req, res): void => {
  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.post("/admin/logout", (_req, res): void => {
  res.status(204).send(AdminLogoutResponse.parse(undefined));
});

export { requireAdmin };
export default router;