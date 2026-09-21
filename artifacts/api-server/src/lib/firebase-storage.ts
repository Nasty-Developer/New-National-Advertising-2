import { randomUUID } from "node:crypto";
import { firebaseBucket } from "./firebase";

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
  folder: "products" | "machines" | "services" | "requests";
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
  const file = firebaseBucket().file(objectPath.replace(/^\/+/, ""));
  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
  });
  return url;
}