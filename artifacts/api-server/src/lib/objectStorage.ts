import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { Storage } from "@google-cloud/storage";

const SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
  }
}

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${SIDECAR_ENDPOINT}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const parts = normalized.split("/");
  if (parts.length < 3 || !parts[1] || !parts.slice(2).join("/")) {
    throw new Error("Invalid object storage path");
  }
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

function getPrivateObjectDir(): string {
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR is not configured");
  return dir.replace(/\/$/, "");
}

async function signUploadUrl(bucketName: string, objectName: string): Promise<string> {
  const response = await fetch(`${SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Failed to sign object URL (${response.status})`);
  const body = (await response.json()) as { signed_url?: string };
  if (!body.signed_url) throw new Error("Storage did not return a signed URL");
  return body.signed_url;
}

export async function createUploadTarget(): Promise<{ uploadURL: string; objectPath: string }> {
  const { bucketName } = parseObjectPath(getPrivateObjectDir());
  const objectName = `${getPrivateObjectDir().split("/").slice(2).join("/")}/uploads/${randomUUID()}`;
  return {
    uploadURL: await signUploadUrl(bucketName, objectName),
    objectPath: `/objects/${objectName.replace(/^.*?\/uploads\//, "uploads/")}`,
  };
}

export async function getObjectFile(objectPath: string) {
  if (!objectPath.startsWith("/objects/")) throw new ObjectNotFoundError();
  const objectName = objectPath.slice("/objects/".length);
  const { bucketName } = parseObjectPath(getPrivateObjectDir());
  const prefix = getPrivateObjectDir().split("/").slice(2).join("/");
  const file = objectStorageClient.bucket(bucketName).file(`${prefix}/${objectName}`);
  const [exists] = await file.exists();
  if (!exists) throw new ObjectNotFoundError();
  return file;
}

export async function streamObject(file: Awaited<ReturnType<typeof getObjectFile>>) {
  const [metadata] = await file.getMetadata();
  return {
    headers: {
      "Content-Type": metadata.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(metadata.size ? { "Content-Length": String(metadata.size) } : {}),
    },
    stream: Readable.toWeb(file.createReadStream()) as ReadableStream,
  };
}