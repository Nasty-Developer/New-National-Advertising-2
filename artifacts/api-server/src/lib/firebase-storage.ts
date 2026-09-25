import { randomUUID } from "node:crypto";
import { firebaseBucket, firestore, hasFirebaseConfiguration } from "./firebase";

const allowedContentTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxBytes = 10 * 1024 * 1024;

export function validateUpload(input: { size: number; contentType: string }) {
  if (!Number.isInteger(input.size) || input.size < 1 || input.size > maxBytes) {
    throw new Error("Files must be smaller than 10 MB.");
  }
  if (!allowedContentTypes.has(input.contentType)) {
    throw new Error("Only JPG, PNG, WebP, and PDF files are accepted.");
  }
}

export async function createFirebaseUploadTarget(input: {
  folder: "products" | "machines" | "services" | "projects" | "requests";
  name: string;
  contentType: string;
  size: number;
}) {
  validateUpload(input);
  const safeName = input.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "upload";
  const objectPath = `${input.folder}/${randomUUID()}-${safeName}`;
  const file = firebaseBucket().file(objectPath);
  const [uploadURL] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType: input.contentType,
  });
  return { uploadURL, objectPath: `/${objectPath}` };
}

export async function createFirebaseReadUrl(objectPath: string | null | undefined) {
  if (!objectPath) return null;
  if (objectPath.startsWith("http")) return objectPath;
  if (objectPath.startsWith("/") && !/^\/(products|machines|services|projects|requests)\//.test(objectPath)) return objectPath;
  if (!hasFirebaseConfiguration()) return objectPath;
  try {
    const file = firebaseBucket().file(objectPath.replace(/^\/+/, ""));
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 60 * 60 * 1000,
    });
    return url;
  } catch {
    return objectPath;
  }
}

export function normalizeFirebaseProductImagePath(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  const trimmed = value.trim();
  let objectPath: string | null = null;

  if (!/^https?:\/\//i.test(trimmed)) {
    objectPath = trimmed.replace(/^\/+/, "");
  } else if (hasFirebaseConfiguration()) {
    try {
      const url = new URL(trimmed);
      const bucketName = firebaseBucket().name;
      const decodedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");

      if (url.hostname === `${bucketName}.storage.googleapis.com`) {
        objectPath = decodedPath;
      } else if (url.hostname === "storage.googleapis.com") {
        const bucketPrefix = `${bucketName}/`;
        if (decodedPath.startsWith(bucketPrefix)) {
          objectPath = decodedPath.slice(bucketPrefix.length);
        }
      } else if (url.hostname === "firebasestorage.googleapis.com") {
        const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
        if (match && decodeURIComponent(match[1]) === bucketName) {
          objectPath = decodeURIComponent(match[2]);
        }
      }
    } catch {
      return null;
    }
  }

  return objectPath?.startsWith("products/") ? `/${objectPath}` : null;
}

export async function createFirebaseDownloadUrl(
  imagePath: string | null | undefined,
): Promise<string | null> {
  if (!imagePath) return null;

  const normalizedPath = normalizeFirebaseProductImagePath(imagePath);
  if (!normalizedPath || !hasFirebaseConfiguration()) return imagePath;

  const bucket = firebaseBucket();
  const objectPath = normalizedPath.replace(/^\/+/, "");
  const file = bucket.file(objectPath);
  const [metadata] = await file.getMetadata();
  const storedTokens = metadata.metadata?.firebaseStorageDownloadTokens;
  let token = storedTokens?.split(",").map((value) => value.trim()).find(Boolean);

  if (!token) {
    token = randomUUID();
    await file.setMetadata({
      metadata: {
        ...metadata.metadata,
        firebaseStorageDownloadTokens: token,
      },
    });
  }

  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket.name)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`;
}

function referencesProductImage(value: unknown, objectPath: string): boolean {
  if (typeof value === "string") {
    return (
      value === objectPath ||
      value === `/${objectPath}` ||
      normalizeFirebaseProductImagePath(value) === `/${objectPath}`
    );
  }
  if (Array.isArray(value)) {
    return value.some((item) => referencesProductImage(item, objectPath));
  }
  if (value && typeof value === "object") {
    return Object.values(value).some((item) =>
      referencesProductImage(item, objectPath),
    );
  }
  return false;
}

export async function deleteFirebaseProductImageIfUnreferenced(
  imagePath: string | null | undefined,
): Promise<void> {
  const normalizedPath = normalizeFirebaseProductImagePath(imagePath);
  if (!normalizedPath || !hasFirebaseConfiguration()) return;

  const objectPath = normalizedPath.replace(/^\/+/, "");
  const collectionNames = [
    "products",
    "machines",
    "services",
    "projects",
    "requests",
  ];

  try {
    const snapshots = await Promise.all(
      collectionNames.map((name) => firestore().collection(name).get()),
    );
    const isReferenced = snapshots.some((snapshot) =>
      snapshot.docs.some((doc) =>
        referencesProductImage(doc.data(), objectPath),
      ),
    );
    if (isReferenced) return;

    await firebaseBucket().file(objectPath).delete({ ignoreNotFound: true });
  } catch (error) {
    console.warn(
      "[firebase-storage] Could not clean up an unreferenced product image",
      error instanceof Error ? error.message : "unknown storage error",
    );
  }
}