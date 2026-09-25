import { Router, type IRouter } from "express";
import { z } from "zod";
import type { DocumentData } from "firebase-admin/firestore";
import { currentAdmin, requireAdmin } from "../lib/firebase-auth";
import { mediaReadUrl, mediaReference } from "../lib/cloudinary-storage";
import { firestore } from "../lib/firebase";
import { ensureExactProductCatalog } from "../lib/product-catalog";

const router: IRouter = Router();

const publicServiceSlugs = new Set([
  "sign-boards",
  "solvent-flex",
  "offset-printing",
  "screen-printing",
  "graphics-design",
  "digital-printing",
]);
const approvedServiceTitles = new Map([
  ["sign-boards", "Signage Board"],
  ["solvent-flex", "Solvent Flex"],
  ["offset-printing", "Flex Printing"],
  ["screen-printing", "Screen Printing"],
  ["graphics-design", "Graphics Design"],
  ["digital-printing", "Digital Printing"],
]);

function normalizeCatalogImage(value: string) {
  return mediaReference(value) ?? value;
}

const machineBody = z.object({
  name: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180),
  category: z.string().trim().max(180).default("Production equipment"),
  shortDescription: z.string().trim().max(500).default(""),
  description: z.string().trim().max(5000),
  fullDescription: z.string().trim().max(10000).default(""),
  specifications: z.array(z.string().trim().min(1).max(240)).max(40).default([]),
  features: z.array(z.string().trim().min(1).max(240)).max(40).default([]),
  applications: z.array(z.string().trim().min(1).max(180)).max(40).default([]),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  imageAlt: z.string().trim().max(180).optional().or(z.literal("")),
  images: z.array(z.string().trim().max(500)).max(30).default([]),
  relatedServices: z.array(z.string().trim().max(180)).max(30).default([]),
  displayOrder: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

const serviceBody = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180),
  category: z.string().trim().max(180).default("Printing and advertising"),
  shortDescription: z.string().trim().max(500).default(""),
  description: z.string().trim().max(5000),
  fullDescription: z.string().trim().max(10000).default(""),
  content: z.string().trim().max(10000).default(""),
  features: z.array(z.string().trim().min(1).max(240)).max(40).default([]),
  images: z.array(z.string().trim().max(500)).max(30).default([]),
  imageAlt: z.string().trim().max(180).optional().or(z.literal("")),
  offerings: z.array(z.string().trim().min(1).max(180)).max(40).default([]),
  applications: z.array(z.string().trim().min(1).max(180)).max(40).default([]),
  materials: z.array(z.string().trim().min(1).max(180)).max(40).default([]),
  whyChoose: z.array(z.string().trim().min(1).max(240)).max(40).default([]),
  relatedSlugs: z.array(z.string().trim().max(180)).max(20).default([]),
  displayOrder: z.number().int().min(0).default(0),
  status: z.enum(["published", "draft", "archived"]).default("published"),
  featured: z.boolean().default(false),
});

const machineSeed = [
  {
    id: "epson-surecolor-s80670",
    name: "Epson SureColor S80670",
    slug: "epson-surecolor-s80670",
    category: "Large-Format Printing",
    shortDescription: "Professional large-format printing for detailed, vibrant advertising output.",
    description: "A professional large-format printing system designed for high-quality wide-format production. The Epson SureColor S80670 shown here is built for detailed, vibrant large-format output and is suitable for producing high-impact advertising and display graphics.",
    imageUrl: "/machine-epson-surecolor-s80670.png",
    imageAlt: "Epson SureColor S80670 large-format printer",
    applications: ["Eco Solvent Flex", "Banner Printing"],
    relatedServices: ["solvent-flex", "banner-printing"],
    displayOrder: 0,
    published: true,
  },
  {
    id: "wide-format-roll-laminator",
    name: "Wide-Format Roll Laminator",
    slug: "wide-format-roll-laminator",
    category: "Finishing Equipment",
    shortDescription: "Controlled roll laminating for advertising, signage and display graphics.",
    description: "A wide-format roll laminating and finishing machine designed to handle large printed media through a controlled roller-based process. It is suitable for finishing printed materials used in advertising, signage, display graphics and other large-format applications.",
    imageUrl: "/machine-wide-format-laminator.png",
    imageAlt: "Wide-format roll laminator",
    applications: ["Eco Solvent Flex", "Banner Printing", "Signage Board"],
    relatedServices: ["solvent-flex", "banner-printing", "sign-boards"],
    displayOrder: 1,
    published: true,
  },
  {
    id: "large-format-printing-machine",
    name: "Large-Format Printing Machine",
    slug: "large-format-printing-machine",
    category: "Wide-Format Production",
    shortDescription: "Roll-to-roll production for banners, signage graphics and advertising materials.",
    description: "A professional wide-format printing machine used for producing large printed graphics and advertising materials. The machine shown is actively handling roll media and producing large-format printed output, making it suitable for applications such as banners, signage graphics and other large visual advertising materials.",
    imageUrl: "/machine-large-format-printer.png",
    imageAlt: "Large-format roll-to-roll printing machine",
    applications: ["Eco Solvent Flex", "Banner Printing", "Signage Board"],
    relatedServices: ["solvent-flex", "banner-printing", "sign-boards"],
    displayOrder: 2,
    published: true,
  },
  {
    id: "co2-laser-cutting-engraving-machine",
    name: "CO₂ Laser Cutting & Engraving Machine",
    slug: "co2-laser-cutting-engraving-machine",
    category: "Laser Cutting & Engraving",
    shortDescription: "Precise cutting, engraving and custom fabrication for display work.",
    description: "A professional laser cutting and engraving machine designed for precise cutting, engraving, and custom fabrication work. It is suitable for producing detailed signage elements, lettering, decorative pieces, panels, templates, and other customized advertising and display materials.",
    imageUrl: "/machine-co2-laser-cutter.png",
    imageAlt: "CO₂ laser cutting and engraving machine",
    applications: ["Precision Laser Cutting", "Laser Engraving", "Custom Lettering & Shapes", "Signage Components", "Decorative Panels", "Advertising & Display Materials", "Custom Fabrication Work"],
    relatedServices: ["sign-boards", "graphics-design"],
    displayOrder: 3,
    published: true,
  },
  {
    id: "konica-minolta-bizhub-c6000",
    name: "Konica Minolta bizhub C6000",
    slug: "konica-minolta-bizhub-c6000",
    category: "Digital Printing Machine",
    shortDescription: "Professional digital production printing for crisp, consistent commercial output.",
    description: "The Konica Minolta bizhub C6000 is a professional digital printing machine designed for reliable, high-quality production of business cards, brochures, catalogues, flyers and other commercial print materials.",
    imageUrl: "/machine-konica-minolta-bizhub-c6000.png",
    imageAlt: "Konica Minolta bizhub C6000 digital printing machine",
    applications: ["Digital Printing", "Business Cards", "Brochures & Catalogues", "Flyers & Marketing Materials"],
    relatedServices: ["digital-printing", "Flex Printing"],
    displayOrder: 4,
    published: true,
  },
] as const;

const serviceSeed = [
  ["sign-boards", "Signage Board", "Signage solutions", "Professional signage solutions designed to make businesses, brands and storefronts visible and memorable.", ["Acrylic Clip-on Boards", "Crystal Letters", "LED Signage", "Steel & Brass Letters", "Pixel LED", "Backlit Signage", "Kitchen", "Badge", "Paper Bed", "Sandwich"], ["Shop Signage", "Office Signage", "Brand Displays", "Promotional Displays", "Indoor Signage", "Outdoor Signage", "Event Displays"], "service-sign-boards.jpg"],
  ["banner-printing", "Banner Printing", "Advertising materials", "Large-format advertising banners for businesses, promotions, events and outdoor visibility.", ["Banner Printing", "Advertising Materials"], ["Store promotions", "Event backdrops", "Outdoor advertising", "Launch announcements", "Directional displays"], "service-banner-printing.jpg"],
  ["solvent-flex", "Solvent Flex", "Large-format printing", "Large-format printing solutions for banners, displays, branding and promotional applications.", ["Star Flex", "Star Black Back", "One Way Vision", "Canvas", "Gloss Vinyl", "Matt Vinyl", "Vinyl with Sunboard", "Vinyl with Sunpack", "Sunboard 3mm / 5mm", "Backlight Printing"], ["Advertising Banners", "Shop Branding", "Outdoor Advertising", "Window Graphics", "Promotional Displays", "Backlit Displays"], "service-solvent-flex.jpg"],
  ["offset-printing", "Flex Printing", "Commercial printing", "Professional printed materials for businesses, events, stationery and marketing requirements.", ["Brochure & Catalogues", "Calendars", "Letterheads", "Business Cards", "Bill Books", "Envelopes", "Wedding Cards", "Flyers & Leaflets", "Pavti Books", "Menu Cards"], ["Business stationery", "Marketing collateral", "Event materials", "Retail menus", "Wedding and invitation suites"], "service-offset-printing.jpg"],
  ["screen-printing", "Screen Printing", "Custom print finishes", "Custom screen printing for apparel, promotional products and printed materials.", ["Wedding Cards", "Visiting Cards", "Letterheads", "T-Shirts", "Cup Print", "Envelopes", "Caps", "Umbrellas", "Carry Bags", "ID Ribbons", "School Bags"], ["Apparel printing", "Promotional products", "School and event materials", "Carry bags", "Stationery"], "service-screen-printing.jpg"],
  ["graphics-design", "Graphics Design", "Brand and creative design", "Professional creative design solutions for branding, marketing and communication.", ["Logo Design", "Social Media Posts", "Hoarding Banners", "Menu Cards", "Flyers", "Product Packaging", "Magazine Ads", "Visiting Cards", "Invitations", "Brochures", "Calendars"], ["Brand identity", "Social media communication", "Retail and menu design", "Packaging", "Advertising campaigns"], "service-graphics-design.jpg"],
  ["digital-printing", "Digital Printing", "Fast, detailed printing", "High-quality digital printing for business, promotional and everyday printing requirements.", ["Visiting Cards", "Bill Book", "Wedding Card", "Brochures", "Catalogues", "Pamphlets", "Posters", "Annual Reports", "UV Print", "Hotel Menus", "Hospital Files", "Trophy Stickers"], ["Business cards", "Marketing handouts", "Posters and pamphlets", "Menus and reports", "Specialty printed pieces"], "service-digital-printing.jpg"],
] as const;

const providedServiceImageSeeds = [
  ["solvent-flex", "service-images/solvent-flex.png", "file_000000005d0c81f59b4affa369e5ab8a_1790081802481.png"],
  ["digital-printing", "service-images/digital-printing.png", "file_000000001f4081f593ead5688281e49b_1790081813324.png"],
  ["offset-printing", "service-images/offset-printing.png", "file_00000000bec481f5ad95083f9227f996_1790081830489.png"],
  ["sign-boards", "service-images/sign-boards.png", "file_00000000e468820ba6a74d0c6e975121_1790081862129.png"],
  ["screen-printing", "service-images/screen-printing.png", "file_000000001c0881f5b3a4184e23a7d362_1790081878225.png"],
  ["graphics-design", "service-images/graphics-design.png", "file_00000000721481f796e2177b9a56bab7_1790081846306.png"],
] as const;

async function syncProvidedServiceImages() {
  const services = firestore().collection("services");
  await Promise.all(providedServiceImageSeeds.map(async ([slug, localPath]) => {
    const reference = services.doc(slug);
    const current = await reference.get();
    if (!current.exists) return;

    let imagePath = `/${localPath}`;
    const data = current.data();
    const updates: DocumentData = {};
    const title = approvedServiceTitles.get(slug);
    if (title && data.title !== title) updates.title = title;
    if (JSON.stringify(data.images ?? []) !== JSON.stringify([imagePath])) updates.images = [imagePath];
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await reference.set(updates, { merge: true });
    }
  }));
}

function collections() {
  return {
    machines: firestore().collection("machines"),
    services: firestore().collection("services"),
  };
}

let catalogCleanupPromise: Promise<void> | undefined;

async function cleanupCatalog() {
  const [serviceSnapshot] = await Promise.all([
    firestore().collection("services").get(),
  ]);
  await Promise.all(serviceSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const updates: DocumentData = {};
      const title = approvedServiceTitles.get(String(data.slug ?? doc.id));
      if (title && data.title !== title) updates.title = title;
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await firestore().collection("services").doc(doc.id).set(updates, { merge: true });
      }
    }));
}

async function ensureSeeded() {
  catalogCleanupPromise ??= cleanupCatalog();
  await catalogCleanupPromise;
  const { machines, services } = collections();
  await Promise.all(machineSeed.map(async (seed) => {
    const reference = machines.doc(seed.id);
    if (!(await reference.get()).exists) {
      const now = new Date();
      await reference.set({ ...seed, fullDescription: seed.description, specifications: [], features: seed.applications, images: seed.imageUrl ? [seed.imageUrl] : [], createdAt: now, updatedAt: now });
    }
  }));
  await Promise.all(serviceSeed.map(async ([slug, title, category, description, offerings, applications, image]) => {
    const reference = services.doc(slug);
    if (!(await reference.get()).exists) {
      const now = new Date();
      await reference.set({ title, slug, category, shortDescription: description, description, fullDescription: description, content: description, features: [], images: [`/${image}`], imageAlt: title, offerings, applications, materials: [], whyChoose: [], relatedSlugs: [], displayOrder: serviceSeed.findIndex((item) => item[0] === slug), status: "published", featured: false, createdAt: now, updatedAt: now });
    }
  }));
  await syncProvidedServiceImages();
  await ensureExactProductCatalog();
}

async function publicDocuments(kind: "machines" | "services") {
  await ensureSeeded();
  const snapshot = await collections()[kind].get();
  return Promise.all(snapshot.docs
    .filter((doc) => kind === "machines"
      ? doc.data().published !== false
      : doc.data().status === "published" && publicServiceSlugs.has(String(doc.data().slug ?? doc.id)))
    .sort((a, b) => catalogOrder(kind, a.data(), b.data()))
    .map(async (doc) => {
      const data = doc.data();
      const images = Array.isArray(data.images) ? data.images : data.imageUrl ? [data.imageUrl] : [];
      return {
        id: doc.id,
        ...data,
        imageUrl: kind === "machines" ? mediaReadUrl(data.imageUrl ?? images[0]) : undefined,
        images: images.map((image: string) => mediaReadUrl(image)),
      };
    }));
}

const machinePriority = [
  ["laser", "co2"],
  ["epson"],
  ["512i", "konica", "flex"],
  ["excel", "z"],
  ["konica", "minolta"],
];

function normalizedName(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/₂/g, "2")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function priorityFor(name: unknown, priorities: string[][]) {
  const value = normalizedName(name);
  return priorities.findIndex((tokens) => tokens.every((token) => value.includes(token)));
}

const productPriority = [
  ["signage"],
  ["banner"],
  ["brochure"],
  ["acrylic", "clip", "board"],
  ["calendar"],
  ["business", "card"],
  ["letterhead"],
  ["hoarding", "banner"],
];

function catalogOrder(kind: "machines" | "services", left: DocumentData, right: DocumentData) {
  const priorities = kind === "machines" ? machinePriority : [];
  const leftRank = priorityFor(left.name, priorities);
  const rightRank = priorityFor(right.name, priorities);
  const leftPriority = leftRank < 0 ? Number.MAX_SAFE_INTEGER : leftRank;
  const rightPriority = rightRank < 0 ? Number.MAX_SAFE_INTEGER : rightRank;
  return leftPriority - rightPriority
    || Number(left.displayOrder ?? 0) - Number(right.displayOrder ?? 0)
    || normalizedName(left.name).localeCompare(normalizedName(right.name));
}

router.get("/machines", async (_req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await publicDocuments("machines"));
});

router.get("/services", async (_req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await publicDocuments("services"));
});

router.get("/admin/machines", requireAdmin, async (_req, res): Promise<void> => {
  await ensureSeeded();
  const snapshot = await collections().machines.get();
  const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Array<{ id: string; displayOrder?: number }>;
  res.json(rows.sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0)));
});

router.post("/admin/machines", requireAdmin, async (req, res): Promise<void> => {
  const parsed = machineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid machine details", details: parsed.error.flatten() });
    return;
  }
  const now = new Date();
  const reference = collections().machines.doc();
  const imageUrl = parsed.data.imageUrl ? normalizeCatalogImage(parsed.data.imageUrl) : "";
  const images = parsed.data.images.map(normalizeCatalogImage).filter(Boolean);
  await reference.set({ ...parsed.data, imageUrl, fullDescription: parsed.data.fullDescription || parsed.data.description, images: images.length ? images : imageUrl ? [imageUrl] : [], createdAt: now, updatedAt: now, createdBy: currentAdmin(res).uid, updatedBy: currentAdmin(res).uid });
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
  const now = new Date();
  const imageUrl = parsed.data.imageUrl ? normalizeCatalogImage(parsed.data.imageUrl) : "";
  const images = parsed.data.images.map(normalizeCatalogImage).filter(Boolean);
  const nextImages = images.length ? images : imageUrl ? [imageUrl] : [];
  await reference.set({ ...parsed.data, imageUrl, fullDescription: parsed.data.fullDescription || parsed.data.description, images: nextImages, updatedAt: now, updatedBy: currentAdmin(res).uid }, { merge: true });
  res.json({ id: reference.id, ...parsed.data, updatedAt: now });
});

router.delete("/admin/machines/:id", requireAdmin, async (req, res): Promise<void> => {
  const reference = collections().machines.doc(String(req.params.id));
  if (!(await reference.get()).exists) {
    res.status(404).json({ error: "Machine not found" });
    return;
  }
  await reference.delete();
  res.sendStatus(204);
});

router.get("/admin/services", requireAdmin, async (_req, res): Promise<void> => {
  await ensureSeeded();
  const snapshot = await collections().services.get();
  const rows = snapshot.docs
    .filter((doc) => publicServiceSlugs.has(String(doc.data().slug ?? doc.id)))
    .map((doc) => ({ id: doc.id, ...doc.data() })) as Array<{ id: string; displayOrder?: number }>;
  res.json(rows.sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0)));
});

router.post("/admin/services", requireAdmin, async (req, res): Promise<void> => {
  const parsed = serviceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid service details", details: parsed.error.flatten() });
    return;
  }
  const now = new Date();
  const reference = collections().services.doc();
  await reference.set({ ...parsed.data, images: parsed.data.images.map(normalizeCatalogImage).filter(Boolean), fullDescription: parsed.data.fullDescription || parsed.data.description, content: parsed.data.content || parsed.data.description, createdAt: now, updatedAt: now, createdBy: currentAdmin(res).uid, updatedBy: currentAdmin(res).uid });
  res.status(201).json({ id: reference.id, ...parsed.data, createdAt: now, updatedAt: now });
});

router.put("/admin/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const parsed = serviceBody.safeParse(req.body);
  const reference = collections().services.doc(String(req.params.id));
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid service details", details: parsed.error.flatten() });
    return;
  }
  if (!(await reference.get()).exists) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  const now = new Date();
  const nextImages = parsed.data.images.map(normalizeCatalogImage).filter(Boolean);
  await reference.set({ ...parsed.data, images: nextImages, fullDescription: parsed.data.fullDescription || parsed.data.description, content: parsed.data.content || parsed.data.description, updatedAt: now, updatedBy: currentAdmin(res).uid }, { merge: true });
  res.json({ id: reference.id, ...parsed.data, updatedAt: now });
});

router.delete("/admin/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const reference = collections().services.doc(String(req.params.id));
  if (!(await reference.get()).exists) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  await reference.delete();
  res.sendStatus(204);
});

export default router;