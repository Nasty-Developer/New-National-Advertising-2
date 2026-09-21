import { Router, type IRouter } from "express";
import {
  CreateProjectBody,
  CreateProjectResponse,
  DeleteProjectParams,
  GetAdminProjectsResponse,
  GetPublicProjectsResponse,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProjectResponse,
} from "@workspace/api-zod";
import type { DocumentData } from "firebase-admin/firestore";
import { currentAdmin, requireAdmin } from "../lib/firebase-auth";
import { createFirebaseReadUrl } from "../lib/firebase-storage";
import { firestore } from "../lib/firebase";

const router: IRouter = Router();
const projects = () => firestore().collection("projects");

function toDate(value: unknown): Date {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function projectResponse(id: string, data: DocumentData, signedUrls: boolean) {
  const imagePath = data.imagePath ?? null;
  const additionalImages = Array.isArray(data.additionalImages) ? data.additionalImages : [];
  return {
    id,
    name: String(data.name ?? ""),
    shortDescription: String(data.shortDescription ?? ""),
    fullDescription: String(data.fullDescription ?? ""),
    imagePath: signedUrls ? await createFirebaseReadUrl(imagePath) : imagePath,
    additionalImages: signedUrls
      ? await Promise.all(additionalImages.map((path: string) => createFirebaseReadUrl(path)))
      : additionalImages,
    videoUrl: typeof data.videoUrl === "string" ? data.videoUrl : "",
    published: data.published === true,
    featured: data.featured === true,
    displayOrder: Number(data.displayOrder ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function projectValues(data: {
  name: string;
  shortDescription: string;
  fullDescription: string;
  imagePath?: string | null;
  additionalImages?: string[];
  videoUrl?: string;
  published?: boolean;
  featured?: boolean;
  displayOrder?: number;
}, uid: string) {
  const now = new Date();
  return {
    name: data.name.trim(),
    slug: slugify(data.name),
    shortDescription: data.shortDescription.trim(),
    fullDescription: data.fullDescription.trim(),
    imagePath: data.imagePath || null,
    additionalImages: data.additionalImages ?? [],
    videoUrl: data.videoUrl?.trim() || "",
    published: data.published === true,
    featured: data.featured === true,
    displayOrder: data.displayOrder ?? 0,
    deleted: false,
    createdAt: now,
    updatedAt: now,
    createdBy: uid,
    updatedBy: uid,
  };
}

router.get("/projects", async (_req, res): Promise<void> => {
  const snapshot = await projects().get();
  const rows = await Promise.all(snapshot.docs
    .filter((doc) => doc.data().deleted !== true && doc.data().published === true)
    .sort((a, b) => Number(a.data().displayOrder ?? 0) - Number(b.data().displayOrder ?? 0))
    .map((doc) => projectResponse(doc.id, doc.data(), true)));
  res.json(GetPublicProjectsResponse.parse(rows));
});

router.get("/admin/projects", requireAdmin, async (_req, res): Promise<void> => {
  const snapshot = await projects().get();
  const rows = await Promise.all(snapshot.docs
    .filter((doc) => doc.data().deleted !== true)
    .sort((a, b) => Number(a.data().displayOrder ?? 0) - Number(b.data().displayOrder ?? 0))
    .map((doc) => projectResponse(doc.id, doc.data(), false)));
  res.json(GetAdminProjectsResponse.parse(rows));
});

router.post("/admin/projects", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid project details", details: parsed.error.flatten() });
    return;
  }
  const admin = currentAdmin(res);
  const reference = projects().doc();
  await reference.set(projectValues(parsed.data, admin.uid));
  res.status(201).json(CreateProjectResponse.parse(await projectResponse(reference.id, (await reference.get()).data()!, false)));
});

router.put("/admin/projects/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid project details" });
    return;
  }
  const reference = projects().doc(params.data.id);
  const snapshot = await reference.get();
  if (!snapshot.exists || snapshot.data()?.deleted === true) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const admin = currentAdmin(res);
  await reference.set({
    ...projectValues(parsed.data, admin.uid),
    createdAt: snapshot.data()?.createdAt ?? new Date(),
    createdBy: snapshot.data()?.createdBy ?? admin.uid,
  }, { merge: true });
  res.json(UpdateProjectResponse.parse(await projectResponse(reference.id, (await reference.get()).data()!, false)));
});

router.delete("/admin/projects/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }
  const reference = projects().doc(params.data.id);
  if (!(await reference.get()).exists) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  await reference.set({ deleted: true, published: false, featured: false, updatedAt: new Date(), updatedBy: currentAdmin(res).uid }, { merge: true });
  res.sendStatus(204);
});

export default router;