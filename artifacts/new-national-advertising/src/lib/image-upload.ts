import { firebaseAuth } from "@/lib/firebase-client";
import type { UploadRequestContentType } from "@workspace/api-client-react";

export type ImageUploadFolder =
  | "products"
  | "category-images"
  | "machines"
  | "services"
  | "projects"
  | "requests";

type UploadTarget = {
  uploadURL: string;
  uploadToken?: string;
};

type UploadInput = {
  name: string;
  size: number;
  contentType: UploadRequestContentType;
  folder: ImageUploadFolder;
};

type UploadRequester = (input: { data: UploadInput }) => Promise<UploadTarget>;

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const maxBytes = 10 * 1024 * 1024;

export async function uploadFileToServer(
  file: File,
  folder: ImageUploadFolder,
  requestUpload: UploadRequester,
  onProgress: (progress: number) => void = () => {},
): Promise<string> {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or PDF file.");
  }
  if (file.size < 1 || file.size > maxBytes) {
    throw new Error("Files must be between 1 byte and 10 MB.");
  }

  const user = firebaseAuth?.currentUser;
  if (!user) {
    throw new Error("Your admin session has expired. Sign in again before uploading.");
  }

  const target = await requestUpload({
    data: {
      name: file.name,
      size: file.size,
      contentType: file.type as UploadRequestContentType,
      folder,
    },
  });
  if (!target.uploadToken) {
    throw new Error("The server did not provide a secure upload ticket. Please try again.");
  }

  const idToken = await user.getIdToken();
  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", target.uploadURL);
    request.timeout = 120_000;
    request.setRequestHeader("Content-Type", file.type);
    request.setRequestHeader("Authorization", `Bearer ${idToken}`);
    request.setRequestHeader("X-Upload-Ticket", target.uploadToken!);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(
          Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100))),
        );
      }
    };
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Cloudinary rejected the upload (HTTP ${request.status}).`));
        return;
      }
      try {
        const result = JSON.parse(request.responseText) as { objectPath?: unknown };
        if (typeof result.objectPath !== "string" || !/^https?:\/\//i.test(result.objectPath)) {
          reject(new Error("The upload completed without a valid Cloudinary URL."));
          return;
        }
        onProgress(100);
        resolve(result.objectPath);
      } catch {
        reject(new Error("The upload completed without a valid storage confirmation."));
      }
    };
    request.onerror = () =>
      reject(new Error("The image upload failed. Check your connection and try again."));
    request.ontimeout = () =>
      reject(new Error("The image upload timed out. Please try again."));
    request.onabort = () => reject(new Error("The image upload was cancelled."));
    request.send(file);
  });
}