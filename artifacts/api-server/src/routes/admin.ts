import { timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type RequestHandler } from "express";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  GetAdminSessionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminAuthenticated(req: { signedCookies?: Record<string, unknown> }): boolean {
  return req.signedCookies?.admin_session === "authenticated";
}

export const requireAdmin: RequestHandler = (req, res, next): void => {
  if (!isConfigured()) {
    res.status(503).json({ error: "Admin authentication is not configured" });
    return;
  }
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
};

router.get("/admin/session", (req, res): void => {
  if (!isConfigured()) {
    res.status(503).json({ error: "Admin authentication is not configured" });
    return;
  }
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  res.json(GetAdminSessionResponse.parse({ authenticated: true }));
});

router.post("/admin/login", (req, res): void => {
  if (!isConfigured()) {
    res.status(503).json({ error: "Admin authentication is not configured" });
    return;
  }
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email and password" });
    return;
  }

  const emailMatches = safeEqual(parsed.data.email.trim().toLowerCase(), process.env.ADMIN_EMAIL!.trim().toLowerCase());
  const passwordMatches = safeEqual(parsed.data.password, process.env.ADMIN_PASSWORD!);
  if (!emailMatches || !passwordMatches) {
    req.log.warn({ email: parsed.data.email.trim().toLowerCase() }, "Rejected admin login");
    res.status(401).json({ error: "Invalid admin credentials" });
    return;
  }

  res.cookie("admin_session", "authenticated", {
    signed: true,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000,
  });
  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.post("/admin/logout", (req, res): void => {
  res.clearCookie("admin_session", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.status(204).send(AdminLogoutResponse.parse(undefined));
});

export default router;