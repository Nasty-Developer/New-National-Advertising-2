import type { RequestHandler } from "express";
import { firebaseAuth, firestore } from "./firebase";

export type VerifiedAdmin = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

function bearerToken(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export const requireAdmin: RequestHandler = async (req, res, next): Promise<void> => {
  const token = bearerToken(req.header("authorization"));
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = await firebaseAuth().verifyIdToken(token);
    const user = await firestore().collection("users").doc(decoded.uid).get();
    const data = user.data();
    const isAdmin = data?.role === "admin" && data?.active !== false;
    if (!isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    res.locals.admin = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
    } satisfies VerifiedAdmin;
    next();
  } catch (error) {
    req.log.warn({ err: error }, "Rejected Firebase admin token");
    res.status(401).json({ error: "Authentication required" });
  }
};

export function currentAdmin(res: { locals: Record<string, unknown> }): VerifiedAdmin {
  const admin = res.locals.admin as VerifiedAdmin | undefined;
  if (!admin) throw new Error("Admin identity is not available");
  return admin;
}