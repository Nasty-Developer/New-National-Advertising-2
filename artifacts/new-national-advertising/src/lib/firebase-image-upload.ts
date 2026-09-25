import { firebaseAuth } from "@/lib/firebase-client";
import type { UploadRequestContentType } from "@workspace/api-client-react";

export type FirebaseImageFolder = "products" | "category-images";

type UploadTarget = {
  uploadURL: string;
  uploadToken?: string;
  objectPath: string;
};

type UploadInput = {
  name: string;
  size: number;
  contentType: UploadRequestContentType;
  folder: FirebaseImageFolder;
};

type UploadRequester = (input: { data: UploadInput }) => Promise<UploadTarget>;

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 10 * 1024 * 1024;

export async function uploadFirebaseImage(
  file: File,
  folder: FirebaseImageFolder,
  requestUpload: UploadRequester,
  onProgress: (progress: number) => void,
): Promise<string> {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }
  if (file.size < 1 || file.size > maxBytes) {
    throw new Error("Images must be between 1 byte and 10 MB.");
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
  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", target.uploadURL);
    request.timeout = 120_000;
    request.setRequestHeader("Content-Type", file.type);
    request.setRequestHeader("Authorization", `Bearer ${idToken}`);
    request.setRequestHeader("X-Upload-Ticket", target.uploadToken!);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100))));
      }
    };
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Firebase Storage rejected the upload (HTTP ${request.status}).`));
        return;
      }
      try {
        const result = JSON.parse(request.responseText) as { objectPath?: unknown };
        if (result.objectPath !== target.objectPath) {
          reject(new Error("The server saved the image to an unexpected storage path."));
          return;
        }
        onProgress(100);
        resolve();
      } catch {
        reject(new Error("The upload completed without a valid storage confirmation."));
      }
    };
    request.onerror = () => reject(new Error("The image upload failed. Check your connection and try again."));
    request.ontimeout = () => reject(new Error("The image upload timed out. Please try again."));
    request.onabort = () => reject(new Error("The image upload was cancelled."));
    request.send(file);
  });

  return target.objectPath;
}