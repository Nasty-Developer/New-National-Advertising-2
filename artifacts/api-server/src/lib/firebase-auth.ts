import type { RequestHandler } from "express";
import { firebaseAuth, firebaseProjectId, firestore } from "./firebase";

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

function isFirebaseConfigurationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("required for Firebase-backed production features")
  );
}

function firebaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function firebaseErrorMessage(error: unknown): string | undefined {
  return error instanceof Error && error.message ? error.message : undefined;
}

function tokenMetadata(token: string): {
  audience?: string;
  issuer?: string;
  expired?: boolean;
} {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as { aud?: unknown; iss?: unknown; exp?: unknown };
    const now = Math.floor(Date.now() / 1000);
    return {
      audience: typeof payload.aud === "string" ? payload.aud : undefined,
      issuer: typeof payload.iss === "string" ? payload.iss : undefined,
      expired: typeof payload.exp === "number" ? payload.exp <= now : undefined,
    };
  } catch {
    return {};
  }
}

export const requireAdmin: RequestHandler = async (req, res, next): Promise<void> => {
  const token = bearerToken(req.header("authorization"));
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  let decoded: Awaited<ReturnType<ReturnType<typeof firebaseAuth>["verifyIdToken"]>>;
  try {
    decoded = await firebaseAuth().verifyIdToken(token);
  } catch (error) {
    const metadata = tokenMetadata(token);
    req.log.warn(
      {
        err: error,
        firebaseCode: firebaseErrorCode(error),
        firebaseMessage: firebaseErrorMessage(error),
        serverProjectId: (() => {
          try {
            return firebaseProjectId();
          } catch {
            return undefined;
          }
        })(),
        tokenAudience: metadata.audience,
        tokenIssuer: metadata.issuer,
        tokenExpired: metadata.expired,
      },
      "Rejected Firebase admin token",
    );
    if (isFirebaseConfigurationError(error)) {
      res.status(503).json({ error: "Admin authentication is not configured" });
      return;
    }
    res.status(401).json({ error: "Firebase authentication token was rejected" });
    return;
  }

  try {
    const user = await firestore().collection("users").doc(decoded.uid).get();
    const data = user.data();
    const isAdmin = data?.role === "admin" && data?.active !== false;
    if (!isAdmin) {
      req.log.warn(
        {
          uid: decoded.uid,
          userDocumentExists: user.exists,
          role: typeof data?.role === "string" ? data.role : undefined,
          active: typeof data?.active === "boolean" ? data.active : undefined,
          expectedDocument: "users/{decoded.uid}",
          expectedRole: "admin",
          activeMustNotBeFalse: true,
        },
        "Authenticated Firebase user is not authorized as an admin",
      );
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
    req.log.error({ err: error, uid: decoded.uid }, "Admin authorization lookup failed");
    res.status(503).json({ error: "Admin authorization is temporarily unavailable" });
  }
};

export function currentAdmin(res: { locals: Record<string, unknown> }): VerifiedAdmin {
  const admin = res.locals.admin as VerifiedAdmin | undefined;
  if (!admin) throw new Error("Admin identity is not available");
  return admin;
}