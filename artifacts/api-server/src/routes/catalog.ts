import { Router, type IRouter } from "express";
import { z } from "zod";
import { currentAdmin, requireAdmin } from "../lib/firebase-auth";
import { createFirebaseReadUrl } from "../lib/firebase-storage";
import { firestore } from "../lib/firebase";

const router: IRouter = Router();
const collections = () => ({
  machines: firestore().collection("machines"),
  services: firestore().collection("services"),
});

const machineBody = z.object({
  name: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180),
  category: z.string().trim().max(180).optional().default("Production equipment"),
  description: z.string().trim().max(5000),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  applications: z.array(z.string().trim().min(1).max(180)).max(30).default([]),
  displayOrder: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});
const serviceBody = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180),
  description: z.string().trim().max(5000),
  images: z.array(z.string().trim().max(500)).max(30).default([]),
  offerings: z.array(z.string().trim().min(1).max(180)).max(40).default([]),
  applications: z.array(z.string().trim().min(1).max(180)).max(40).default([]),
  displayOrder: z.number().int().min(0).default(0),
  status: z.enum(["published", "draft"]).default("published"),
});

async function publicDocuments(kind: "machines" | "services") {
  const snapshot = await collections()[kind].get();
  return Promise.all(snapshot.docs
    .filter((doc) => kind === "machines" ? doc.data().published !== false : doc.data().status !== "draft")
    .sort((a, b) => Number(a.data().displayOrder ?? 0) - Number(b.data().displayOrder ?? 0))
    .map(async (doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        ...(kind === "machines" ? { imageUrl: await createFirebaseReadUrl(data.imageUrl) } : {}),
        ...(kind === "services" ? { images: await Promise.all((data.images ?? []).map((image: string) => createFirebaseReadUrl(image))) } : {}),
      };
    }));
}

router.get("/machines", async (_req, res): Promise<void> => {
  res.json(await publicDocuments("machines"));
});

router.get("/services", async (_req, res): Promise<void> => {
  res.json(await publicDocuments("services"));
});

router.get("/admin/machines", requireAdmin, async (_req, res): Promise<void> => {
  const snapshot = await collections().machines.orderBy("displayOrder", "asc").get();
  res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

router.post("/admin/machines", requireAdmin, async (req, res): Promise<void> => {
  const parsed = machineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid machine details", details: parsed.error.flatten() });
    return;
  }
  const now = new Date();
  const reference = collections().machines.doc();
  await reference.set({ ...parsed.data, createdAt: now, updatedAt: now, createdBy: currentAdmin(res).uid, updatedBy: currentAdmin(res).uid });
  res.status(201).json({ id: reference.id, ...parsed.data, createdAt: now, updatedAt: now });
});

router.put("/admin/machines/:id", requireAdmin, async (req, res): Promise<void> => {
  const parsed = machineBody.safeParse(req.body);
  const reference = collections().machines.doc(String(req.params.id));
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid machine details", details: parsed.error.flatten() });
    return;
  }
  if (!(await reference.get()).exists) {
    res.status(404).json({ error: "Machine not found" });
    return;
  }
  await reference.set({ ...parsed.data, updatedAt: new Date(), updatedBy: currentAdmin(res).uid }, { merge: true });
  res.json({ id: reference.id, ...parsed.data });
});

router.delete("/admin/machines/:id", requireAdmin, async (req, res): Promise<void> => {
  const reference = collections().machines.doc(String(req.params.id));
  if (!(await reference.get()).exists) {
    res.status(404).json({ error: "Machine not found" });
    return;
  }
  await reference.set({ published: false, updatedAt: new Date(), updatedBy: currentAdmin(res).uid }, { merge: true });
  res.sendStatus(204);
});

router.get("/admin/services", requireAdmin, async (_req, res): Promise<void> => {
  const snapshot = await collections().services.orderBy("displayOrder", "asc").get();
  res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

export default router;