import { createHmac, timingSafeEqual } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

const allowedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const imageContentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 10 * 1024 * 1024;
const uploadLifetimeMs = 15 * 60 * 1000;
const uploadFolders = [
  "products",
  "category-images",
  "machines",
  "services",
  "projects",
  "requests",
] as const;

export type CloudinaryUploadFolder = (typeof uploadFolders)[number];

export type CloudinaryUploadTicket = {
  folder: CloudinaryUploadFolder;
  name: string;
  contentType: string;
  size: number;
  expiresAt: number;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Cloudinary uploads.`);
  return value;
}

export function hasCloudinaryConfiguration(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: required("CLOUDINARY_CLOUD_NAME"),
    api_key: required("CLOUDINARY_API_KEY"),
    api_secret: required("CLOUDINARY_API_SECRET"),
    secure: true,
  });
  return cloudinary;
}

function ticketSecret(): string {
  return required("SESSION_SECRET");
}

function createUploadTicket(ticket: CloudinaryUploadTicket): string {
  const payload = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  const signature = createHmac("sha256", ticketSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyCloudinaryUploadTicket(
  value: unknown,
): CloudinaryUploadTicket | null {
  if (typeof value !== "string") return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  let expected: Buffer;
  let supplied: Buffer;
  try {
    expected = createHmac("sha256", ticketSecret()).update(payload).digest();
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (!decoded || typeof decoded !== "object") return null;
    const ticket = decoded as Partial<CloudinaryUploadTicket>;
    const validFolder =
      typeof ticket.folder === "string" &&
      uploadFolders.includes(ticket.folder as CloudinaryUploadFolder);
    if (
      !validFolder ||
      typeof ticket.name !== "string" ||
      ticket.name.length < 1 ||
      ticket.name.length > 180 ||
      typeof ticket.contentType !== "string" ||
      !allowedContentTypes.has(ticket.contentType) ||
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
    return ticket as CloudinaryUploadTicket;
  } catch {
    return null;
  }
}

export function validateCloudinaryUpload(input: {
  size: number;
  contentType: string;
}) {
  if (!Number.isInteger(input.size) || input.size < 1 || input.size > maxBytes) {
    throw new Error("Files must be smaller than 10 MB.");
  }
  if (!allowedContentTypes.has(input.contentType)) {
    throw new Error("Only JPG, PNG, WebP, and PDF files are accepted.");
  }
  if (input.contentType === "application/pdf") return;
  if (!imageContentTypes.has(input.contentType)) {
    throw new Error("Images must be JPG, PNG, or WebP files.");
  }
}

export function createCloudinaryUploadTarget(input: {
  folder: CloudinaryUploadFolder;
  name: string;
  contentType: string;
  size: number;
}) {
  validateCloudinaryUpload(input);
  if (!hasCloudinaryConfiguration()) {
    throw new Error("Cloudinary is not configured for uploads.");
  }
  const uploadToken = createUploadTicket({
    folder: input.folder,
    name: input.name.trim(),
    contentType: input.contentType,
    size: input.size,
    expiresAt: Date.now() + uploadLifetimeMs,
  });
  return {
    uploadURL: "/api/storage/uploads/content",
    uploadToken,
    objectPath: "",
  };
}

export async function uploadToCloudinary(
  ticket: CloudinaryUploadTicket,
  contentType: string,
  contents: Buffer,
): Promise<string> {
  if (contentType !== ticket.contentType) {
    throw new Error("The uploaded file type did not match the upload request.");
  }
  if (contents.length !== ticket.size) {
    throw new Error("The uploaded file size did not match the upload request.");
  }
  validateCloudinaryUpload({ size: contents.length, contentType });

  const client = configureCloudinary();
  const resourceType = contentType === "application/pdf" ? "raw" : "image";
  const result = await new Promise<{ secure_url?: string }>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: `new-national-advertising/${ticket.folder}`,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error, uploaded) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(uploaded ?? {});
      },
    );
    stream.end(contents);
  });

  if (!result.secure_url) {
    throw new Error("Cloudinary did not return a secure image URL.");
  }
  return result.secure_url;
}

export function mediaReference(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  if (/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._/-]+$/.test(trimmed)) {
    return `/${trimmed}`;
  }
  return null;
}

export function mediaReadUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  return value;
}