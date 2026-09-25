import { Router, type IRouter } from "express";
import { z } from "zod";
import { currentAdmin, requireAdmin } from "../lib/firebase-auth";
import { firestore } from "../lib/firebase";

const router: IRouter = Router();

const contentBody = z.object({
  heroHeading: z.string().trim().max(240).default("New National Advertising"),
  heroDescription: z.string().trim().max(1000).default("Printing, Signage & Design Solutions"),
  heroImage: z.string().trim().max(500).nullable().optional(),
  heroCtaText: z.string().trim().max(120).default("Get a Quote"),
  aboutTitle: z.string().trim().max(240).default("New National Advertising"),
  aboutBody: z.string().trim().max(4000).default(""),
  qualityBody: z.string().trim().max(4000).default(""),
  trustBody: z.string().trim().max(4000).default(""),
  processBody: z.string().trim().max(4000).default(""),
  graphicsDesignBody: z.string().trim().max(4000).default(""),
  signageBody: z.string().trim().max(4000).default(""),
  contactBody: z.string().trim().max(4000).default(""),
  footerBody: z.string().trim().max(4000).default(""),
  metadataTitle: z.string().trim().max(240).default("New National Advertising | Printing, Signage & Design"),
  metadataDescription: z.string().trim().max(320).default("Printing, signage, advertising and graphic design solutions in Mumbai."),
}).partial();

const settingsBody = z.object({
  businessName: z.string().trim().min(1).max(180),
  email: z.string().trim().email().max(180).or(z.literal("")),
  address: z.string().trim().max(1000),
  whatsappNumbers: z.array(z.string().trim().min(5).max(40)).max(20),
  socialLinks: z.array(z.object({ label: z.string().trim().min(1).max(60), url: z.string().trim().url().max(500) })).max(20),
  googleMapsUrl: z.string().trim().url().max(500).or(z.literal("")),
  footerInformation: z.string().trim().max(2000),
  logoPath: z.string().trim().max(500).nullable().optional(),
  faviconPath: z.string().trim().max(500).nullable().optional(),
  metadataTitle: z.string().trim().max(240),
  metadataDescription: z.string().trim().max(320),
});

const contactBody = z.object({
  label: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(40),
  showOnWebsite: z.boolean().default(true),
  useForCalls: z.boolean().default(true),
  useForWhatsApp: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

const defaultSettings = {
  businessName: "New National Advertising",
  email: "newnationaladv2022@gmail.com",
  address: "Room No. 3, New National Advertising, Plot No. 47, Line No. K, Road No. 5, Opposite Mahesh Jewellers, Govandi West, Mumbai - 400043, India",
  whatsappNumbers: ["9555756577", "7506269783"],
  socialLinks: [],
  googleMapsUrl: "https://maps.app.goo.gl/fp4fTcaVwx2bojXz7",
  footerInformation: "Printing, signage, advertising and graphic design solutions for businesses, brands and individuals.",
  logoPath: "/new-national-advertising-logo.png",
  faviconPath: "/favicon.svg",
  metadataTitle: "New National Advertising | Printing, Signage & Design",
  metadataDescription: "Printing, signage, advertising and graphic design solutions in Mumbai.",
};

const defaultContent = {
  heroHeading: "New National Advertising",
  heroDescription: "Professional printing, advertising, signage and graphic design solutions for businesses, brands and individuals.",
  heroCtaText: "Get a Quote",
  aboutTitle: "New National Advertising",
  aboutBody: "New National Advertising provides printing, signage, advertising and graphic design solutions for businesses, brands and individuals.",
  qualityBody: "Clear, vibrant results made for the real-world places your customers see them.",
  trustBody: "A dependable print partner for everyday business needs, campaigns and events.",
  processBody: "Share your requirement, review the direction, approve production and receive the finished work.",
  graphicsDesignBody: "Practical design support for branding, packaging, menus, marketing and print-ready artwork.",
  signageBody: "Signage, acrylic, LED, backlit and storefront solutions for indoor and outdoor visibility.",
  contactBody: "Tell us what you need and the team will help you choose the right route.",
  footerBody: "Printing, signage, advertising and graphic design solutions for businesses, brands and individuals.",
  metadataTitle: "New National Advertising | Printing, Signage & Design",
  metadataDescription: "Printing, signage, advertising and graphic design solutions in Mumbai.",
};

async function seedSingle(collection: string, id: string, value: Record<string, unknown>) {
  const ref = firestore().collection(collection).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) await ref.set({ ...value, createdAt: new Date(), updatedAt: new Date() });
}

async function ensureCmsSeeded() {
  await Promise.all([
    seedSingle("websiteContent", "homepage", defaultContent),
    seedSingle("websiteSettings", "general", defaultSettings),
  ]);
  const contacts = firestore().collection("contactNumbers");
  const existing = await contacts.limit(1).get();
  if (existing.empty) {
    const now = new Date();
    await Promise.all([
      contacts.doc().set({ label: "Taukeer Ahmed", phone: "9555756577", showOnWebsite: true, useForCalls: true, useForWhatsApp: true, isPrimary: true, displayOrder: 0, createdAt: now, updatedAt: now }),
      contacts.doc().set({ label: "Aurangzeb Khan", phone: "7506269783", showOnWebsite: true, useForCalls: true, useForWhatsApp: false, isPrimary: false, displayOrder: 1, createdAt: now, updatedAt: now }),
    ]);
  }
}

router.get("/website-content", async (_req, res): Promise<void> => {
  await ensureCmsSeeded();
  const snapshot = await firestore().collection("websiteContent").doc("homepage").get();
  res.json({ id: snapshot.id, ...snapshot.data() });
});

router.get("/admin/website-content", requireAdmin, async (_req, res): Promise<void> => {
  await ensureCmsSeeded();
  const snapshot = await firestore().collection("websiteContent").doc("homepage").get();
  res.json({ id: snapshot.id, ...snapshot.data() });
});

router.put("/admin/website-content", requireAdmin, async (req, res): Promise<void> => {
  const parsed = contentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid website content", details: parsed.error.flatten() });
    return;
  }
  const reference = firestore().collection("websiteContent").doc("homepage");
  const existing = await reference.get();
  const now = new Date();
  const value = { ...(existing.data() ?? defaultContent), ...parsed.data, updatedAt: now, updatedBy: currentAdmin(res).uid };
  await reference.set(value, { merge: true });
  res.json({ id: reference.id, ...value });
});

router.get("/settings", async (_req, res): Promise<void> => {
  await ensureCmsSeeded();
  const snapshot = await firestore().collection("websiteSettings").doc("general").get();
  res.json({ id: snapshot.id, ...snapshot.data() });
});

router.get("/admin/settings", requireAdmin, async (_req, res): Promise<void> => {
  await ensureCmsSeeded();
  const snapshot = await firestore().collection("websiteSettings").doc("general").get();
  res.json({ id: snapshot.id, ...snapshot.data() });
});

router.put("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = settingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid website settings", details: parsed.error.flatten() });
    return;
  }
  const reference = firestore().collection("websiteSettings").doc("general");
  const now = new Date();
  const value = { ...parsed.data, updatedAt: now, updatedBy: currentAdmin(res).uid };
  await reference.set(value, { merge: true });
  res.json({ id: reference.id, ...value });
});

router.get("/contact-numbers", async (_req, res): Promise<void> => {
  await ensureCmsSeeded();
  const snapshot = await firestore().collection("contactNumbers").orderBy("displayOrder", "asc").get();
  res.json(snapshot.docs.filter((doc) => doc.data().showOnWebsite !== false).map((doc) => ({ id: doc.id, ...doc.data() })));
});

router.get("/admin/contact-numbers", requireAdmin, async (_req, res): Promise<void> => {
  await ensureCmsSeeded();
  const snapshot = await firestore().collection("contactNumbers").orderBy("displayOrder", "asc").get();
  res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

router.post("/admin/contact-numbers", requireAdmin, async (req, res): Promise<void> => {
  const parsed = contactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid contact number", details: parsed.error.flatten() });
    return;
  }
  const reference = firestore().collection("contactNumbers").doc();
  const now = new Date();
  const value = { ...parsed.data, createdAt: now, updatedAt: now, createdBy: currentAdmin(res).uid, updatedBy: currentAdmin(res).uid };
  await reference.set(value);
  res.status(201).json({ id: reference.id, ...value });
});

router.put("/admin/contact-numbers/:id", requireAdmin, async (req, res): Promise<void> => {
  const parsed = contactBody.safeParse(req.body);
  const reference = firestore().collection("contactNumbers").doc(String(req.params.id));
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid contact number", details: parsed.error.flatten() });
    return;
  }
  if (!(await reference.get()).exists) {
    res.status(404).json({ error: "Contact number not found" });
    return;
  }
  const value = { ...parsed.data, updatedAt: new Date(), updatedBy: currentAdmin(res).uid };
  await reference.set(value, { merge: true });
  res.json({ id: reference.id, ...value });
});

router.delete("/admin/contact-numbers/:id", requireAdmin, async (req, res): Promise<void> => {
  const reference = firestore().collection("contactNumbers").doc(String(req.params.id));
  if (!(await reference.get()).exists) {
    res.status(404).json({ error: "Contact number not found" });
    return;
  }
  await reference.delete();
  res.sendStatus(204);
});

export default router;