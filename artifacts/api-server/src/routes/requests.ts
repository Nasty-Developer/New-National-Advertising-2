import { Router, type IRouter } from "express";
import { z } from "zod";
import { currentAdmin, requireAdmin } from "../lib/firebase-auth";
import { mediaReadUrl } from "../lib/cloudinary-storage";
import { firestore } from "../lib/firebase";

const router: IRouter = Router();
const quoteStatuses = ["new", "contacted", "quoted", "approved", "completed", "cancelled"] as const;
const contactStatuses = ["new", "contacted", "completed", "cancelled"] as const;
const requestText = (max: number) => z.string().trim().min(1).max(max);

const quoteBody = z.object({
  name: requestText(120),
  phone: requestText(40),
  email: z.string().trim().email().max(180).optional().or(z.literal("")),
  service: requestText(160),
  requirementDetails: requestText(4000),
  quantity: z.string().trim().max(100).optional().or(z.literal("")),
  preferredDate: z.string().trim().max(40).optional().or(z.literal("")),
  attachmentUrl: z.string().trim().max(500).optional().or(z.literal("")),
  attachmentName: z.string().trim().max(180).optional().or(z.literal("")),
});
const contactBody = z.object({
  name: requestText(120),
  phone: requestText(40),
  email: z.string().trim().email().max(180).optional().or(z.literal("")),
  message: requestText(4000),
});

function clean<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typeof item === "string" ? item.trim() : item]));
}

function validAttachment(path: string | undefined) {
  return !path || /^https?:\/\//i.test(path) || /^\/?requests\/[a-zA-Z0-9._/-]+$/.test(path);
}

router.post("/requests/quote", async (req, res): Promise<void> => {
  const parsed = quoteBody.safeParse(req.body);
  if (!parsed.success || !validAttachment(parsed.data?.attachmentUrl)) {
    res.status(400).json({ error: "Please check the quote request details and attachment." });
    return;
  }
  const now = new Date();
  const reference = firestore().collection("quoteRequests").doc();
  await reference.set({
    ...clean(parsed.data),
    status: "new",
    source: "website",
    createdAt: now,
    updatedAt: now,
  });
  res.status(201).json({ id: reference.id, status: "new" });
});

router.post("/requests/contact", async (req, res): Promise<void> => {
  const parsed = contactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the contact form details." });
    return;
  }
  const now = new Date();
  const reference = firestore().collection("contactRequests").doc();
  await reference.set({ ...clean(parsed.data), status: "new", createdAt: now, updatedAt: now });
  res.status(201).json({ id: reference.id, status: "new" });
});

async function listRequests(collectionName: "quoteRequests" | "contactRequests") {
  const snapshot = await firestore().collection(collectionName).orderBy("createdAt", "desc").limit(100).get();
  return Promise.all(snapshot.docs.map(async (doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
      ...(collectionName === "quoteRequests" ? { attachmentUrl: mediaReadUrl(data.attachmentUrl) } : {}),
    };
  }));
}

router.get("/admin/requests/quotes", requireAdmin, async (_req, res): Promise<void> => {
  res.json(await listRequests("quoteRequests"));
});

router.get("/admin/requests/contacts", requireAdmin, async (_req, res): Promise<void> => {
  res.json(await listRequests("contactRequests"));
});

router.patch("/admin/requests/:collection/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const collection = req.params.collection === "quotes" ? "quoteRequests" : req.params.collection === "contacts" ? "contactRequests" : null;
  const statusSchema = collection === "quoteRequests" ? z.enum(quoteStatuses) : collection === "contactRequests" ? z.enum(contactStatuses) : null;
  const status = statusSchema?.safeParse(req.body?.status);
  if (!collection || !status?.success) {
    res.status(400).json({ error: "Invalid request status." });
    return;
  }
  const reference = firestore().collection(collection).doc(String(req.params.id));
  const snapshot = await reference.get();
  if (!snapshot.exists) {
    res.status(404).json({ error: "Request not found." });
    return;
  }
  await reference.set({ status: status.data, updatedAt: new Date(), updatedBy: currentAdmin(res).uid }, { merge: true });
  res.json({ id: reference.id, status: status.data });
});

export default router;