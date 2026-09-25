import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { firebaseBucket, firestore, hasFirebaseConfiguration } from "./firebase";

const allowedContentTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const imageContentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 10 * 1024 * 1024;
const storageFolders = ["products", "category-images", "machines", "services", "projects", "requests"] as const;
const imageUploadLifetimeMs = 15 * 60 * 1000;

export type FirebaseImageUploadTicket = {
  objectPath: string;
  contentType: string;
  size: number;
  expiresAt: number;
};

function uploadTicketSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) throw new Error("SESSION_SECRET is required for protected image uploads.");
  return secret;
}

function createImageUploadTicket(ticket: FirebaseImageUploadTicket): string {
  const payload = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  const signature = createHmac("sha256", uploadTicketSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyFirebaseImageUploadTicket(value: unknown): FirebaseImageUploadTicket | null {
  if (typeof value !== "string") return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  let expected: Buffer;
  let supplied: Buffer;
  try {
    expected = createHmac("sha256", uploadTicketSecret()).update(payload).digest();
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const decoded: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded || typeof decoded !== "object") return null;
    const ticket = decoded as Partial<FirebaseImageUploadTicket>;
    const validFolder =
      typeof ticket.objectPath === "string" &&
      (ticket.objectPath.startsWith("products/") ||
        ticket.objectPath.startsWith("category-images/"));
    const objectName = validFolder ? ticket.objectPath!.split("/")[1] : "";
    if (
      !validFolder ||
      !objectName ||
      !/^[a-zA-Z0-9._-]+$/.test(objectName) ||
      typeof ticket.contentType !== "string" ||
      !imageContentTypes.has(ticket.contentType) ||
      typeof ticket.size !== "number" ||
      !Number.isInteger(ticket.size) ||
      ticket.size < 1 ||
      ticket.size > maxBytes ||
      typeof ticket.expiresAt !== "number" ||
      !Number.isInteger(ticket.expiresAt) ||
      ticket.expiresAt <= Date.now()
    ) {
      return null;
    }
    return ticket as FirebaseImageUploadTicket;
  } catch {
    return null;
  }
}

export async function storeFirebaseImageUpload(
  ticket: FirebaseImageUploadTicket,
  contentType: string,
  contents: Buffer,
): Promise<string> {
  if (contentType !== ticket.contentType || !imageContentTypes.has(contentType)) {
    throw new Error("The uploaded file type did not match the signed upload request.");
  }
  if (contents.length !== ticket.size) {
    throw new Error("The uploaded file size did not match the signed upload request.");
  }
  validateUpload({ size: contents.length, contentType });

  const file = firebaseBucket().file(ticket.objectPath);
  await file.save(contents, {
    resumable: false,
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: randomUUID(),
      },
    },
    preconditionOpts: { ifGenerationMatch: 0 },
  });
  return `/${ticket.objectPath}`;
}

export function validateUpload(input: { size: number; contentType: string }) {
  if (!Number.isInteger(input.size) || input.size < 1 || input.size > maxBytes) {
    throw new Error("Files must be smaller than 10 MB.");
  }
  if (!allowedContentTypes.has(input.contentType)) {
    throw new Error("Only JPG, PNG, WebP, and PDF files are accepted.");
  }
}

export async function createFirebaseUploadTarget(input: {
  folder: "products" | "category-images" | "machines" | "services" | "projects" | "requests";
  name: string;
  contentType: string;
  size: number;
}) {
  validateUpload(input);
  const safeName = input.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "upload";
  const objectPath = `${input.folder}/${randomUUID()}-${safeName}`;
  if (input.folder === "products" || input.folder === "category-images") {
    if (!imageContentTypes.has(input.contentType)) {
      throw new Error("Product and category images must be JPG, PNG, or WebP files.");
    }
    firebaseBucket();
    const uploadToken = createImageUploadTicket({
      objectPath,
      contentType: input.contentType,
      size: input.size,
      expiresAt: Date.now() + imageUploadLifetimeMs,
    });
    return {
      uploadURL: "/api/storage/uploads/content",
      uploadToken,
      objectPath: `/${objectPath}`,
    };
  }

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
  const normalizedPath = normalizeFirebaseStoragePath(objectPath);
  if (!normalizedPath) return objectPath;
  if (!hasFirebaseConfiguration()) return objectPath;
  try {
    const file = firebaseBucket().file(normalizedPath.replace(/^\/+/, ""));
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
  const path = normalizeFirebaseStoragePath(value);
  return path?.startsWith("/products/") ? path : null;
}

export function normalizeFirebaseCategoryImagePath(value: unknown): string | null {
  const path = normalizeFirebaseStoragePath(value);
  return path?.startsWith("/category-images/") ? path : null;
}

export async function createFirebaseImageDownloadUrl(
  imagePath: string | null | undefined,
  expectedFolder: "products" | "category-images",
): Promise<string> {
  const normalizedPath =
    expectedFolder === "products"
      ? normalizeFirebaseProductImagePath(imagePath)
      : normalizeFirebaseCategoryImagePath(imagePath);
  if (!normalizedPath) {
    throw new Error(`Upload the image into the ${expectedFolder} folder before saving.`);
  }
  if (!hasFirebaseConfiguration()) {
    throw new Error("Firebase Storage is not configured for image uploads.");
  }

  const file = firebaseBucket().file(normalizedPath.replace(/^\/+/, ""));
  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size);
  if (
    !Number.isInteger(size) ||
    size < 1 ||
    size > maxBytes ||
    typeof metadata.contentType !== "string" ||
    !imageContentTypes.has(metadata.contentType)
  ) {
    throw new Error("The selected Firebase image is missing or has an unsupported format.");
  }
  const downloadUrl = await createFirebaseDownloadUrl(normalizedPath);
  if (!downloadUrl) {
    throw new Error("Firebase Storage did not return a permanent image URL.");
  }
  return downloadUrl;
}

export function normalizeFirebaseStoragePath(value: unknown): string | null {
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

  return objectPath && storageFolders.some((folder) => objectPath?.startsWith(`${folder}/`))
    ? `/${objectPath}`
    : null;
}

export async function createFirebaseDownloadUrl(
  imagePath: string | null | undefined,
): Promise<string | null> {
  if (!imagePath) return null;

  const normalizedPath = normalizeFirebaseStoragePath(imagePath);
  if (!normalizedPath || !hasFirebaseConfiguration()) return imagePath;

  const bucket = firebaseBucket();
  const objectPath = normalizedPath.replace(/^\/+/, "");
  const file = bucket.file(objectPath);
  const [metadata] = await file.getMetadata();
  const storedTokens = metadata.metadata?.firebaseStorageDownloadTokens;
  let token =
    typeof storedTokens === "string"
      ? storedTokens.split(",").map((value) => value.trim()).find(Boolean)
      : undefined;

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
      normalizeFirebaseStoragePath(value) === `/${objectPath}`
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

export async function deleteFirebaseStorageImageIfUnreferenced(
  imagePath: string | null | undefined,
): Promise<void> {
  const normalizedPath = normalizeFirebaseStoragePath(imagePath);
  if (!normalizedPath || !hasFirebaseConfiguration()) return;

  const objectPath = normalizedPath.replace(/^\/+/, "");
  const collectionNames = [
    "products",
    "productCategories",
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
      "[firebase-storage] Could not clean up an unreferenced image",
      error instanceof Error ? error.message : "unknown storage error",
    );
  }
}

export const deleteFirebaseProductImageIfUnreferenced =
  deleteFirebaseStorageImageIfUnreferenced;