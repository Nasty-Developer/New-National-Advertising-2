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
  privacyPolicyBody: z.string().trim().max(16000).default(""),
  termsAndConditionsBody: z.string().trim().max(16000).default(""),
  metadataTitle: z.string().trim().max(240).default("New National Advertising | Printing, Signage & Design"),
  metadataDescription: z.string().trim().max(320).default("Printing, signage, advertising and graphic design solutions."),
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
  businessInformation: z.object({
    legalName: z.string().trim().max(180),
    legalNameVerified: z.boolean(),
    phoneNumberVerificationCandidate: z.string().trim().max(40),
    phoneNumberVerified: z.boolean(),
    addressVerified: z.boolean(),
    gstRegistrationStatus: z.enum(["unverified", "registered", "not_registered", "not_applicable"]),
    gstStatusVerified: z.boolean(),
    gstin: z.string().trim().max(40),
    gstinVerified: z.boolean(),
    gstRegistrationType: z.string().trim().max(120),
    gstEffectiveDate: z.string().trim().max(20),
    udyamStatus: z.enum(["unverified", "registered", "not_applicable"]),
    udyamNumber: z.string().trim().max(80),
    udyamVerified: z.boolean(),
    enterpriseClassification: z.string().trim().max(120),
    maharashtraRegistrationType: z.string().trim().max(160),
    maharashtraIssuingAuthority: z.string().trim().max(160),
    maharashtraRegistrationIdentifier: z.string().trim().max(120),
    maharashtraRegistrationDate: z.string().trim().max(20),
    maharashtraRegistrationStatus: z.string().trim().max(120),
    maharashtraRegistrationVerified: z.boolean(),
    operatingHours: z.string().trim().max(500),
    operatingHoursVerified: z.boolean(),
    customerEnquiryInstructions: z.string().trim().max(1000),
    privacyContactEmail: z.string().trim().email().max(180).or(z.literal("")),
    customerComplaintContact: z.string().trim().max(240),
    lastVerificationDate: z.string().trim().max(20),
  }).partial().optional(),
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
  metadataDescription: "Printing, signage, advertising and graphic design solutions.",
  businessInformation: {
    legalName: "",
    legalNameVerified: false,
    phoneNumberVerificationCandidate: "+919555759677",
    phoneNumberVerified: false,
    addressVerified: false,
    gstRegistrationStatus: "unverified",
    gstStatusVerified: false,
    gstin: "",
    gstinVerified: false,
    gstRegistrationType: "",
    gstEffectiveDate: "",
    udyamStatus: "unverified",
    udyamNumber: "",
    udyamVerified: false,
    enterpriseClassification: "",
    maharashtraRegistrationType: "",
    maharashtraIssuingAuthority: "",
    maharashtraRegistrationIdentifier: "",
    maharashtraRegistrationDate: "",
    maharashtraRegistrationStatus: "",
    maharashtraRegistrationVerified: false,
    operatingHours: "",
    operatingHoursVerified: false,
    customerEnquiryInstructions: "Contact us to discuss your requirements and request a quotation.",
    privacyContactEmail: "newnationaladv2022@gmail.com",
    customerComplaintContact: "newnationaladv2022@gmail.com",
    lastVerificationDate: "",
  },
};

const defaultContent = {
  heroHeading: "New National Advertising",
  heroDescription: "Professional printing, advertising, signage and graphic design solutions for businesses, brands and individuals.",
  heroCtaText: "Get a Quote",
  aboutTitle: "New National Advertising",
  aboutBody: "New National Advertising provides printing, signage, advertising and graphic design solutions for businesses, brands and individuals.",
  qualityBody: "Clear, vibrant results made for the real-world places your customers see them.",
  trustBody: "A dependable print partner for everyday business needs, campaigns and events.",
  processBody: "Share your requirement, discuss the options and request a quotation.",
  graphicsDesignBody: "Practical design support for branding, packaging, menus, marketing and print-ready artwork.",
  signageBody: "Signage, acrylic, LED, backlit and storefront solutions for indoor and outdoor visibility.",
  contactBody: "Tell us what you need and the team will help you choose the right route.",
  footerBody: "Printing, signage, advertising and graphic design solutions for businesses, brands and individuals.",
  privacyPolicyBody: "",
  termsAndConditionsBody: "",
  metadataTitle: "New National Advertising | Printing, Signage & Design",
  metadataDescription: "Printing, signage, advertising and graphic design solutions.",
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

function publicBusinessInformation(value: Record<string, unknown> | undefined) {
  const info = value ?? {};
  const gstVerified = info.gstStatusVerified === true;
  const gstRegistered = gstVerified && info.gstRegistrationStatus === "registered";
  const udyamVerified = info.udyamVerified === true && info.udyamStatus === "registered";
  const maharashtraVerified = info.maharashtraRegistrationVerified === true;
  return {
    legalName: info.legalNameVerified === true ? String(info.legalName ?? "") : "",
    legalNameVerified: info.legalNameVerified === true,
    phoneNumberVerificationCandidate: "",
    phoneNumberVerified: info.phoneNumberVerified === true,
    addressVerified: info.addressVerified === true,
    gstRegistrationStatus: gstVerified ? info.gstRegistrationStatus : "unverified",
    gstStatusVerified: gstVerified,
    gstin: gstRegistered && info.gstinVerified === true ? String(info.gstin ?? "") : "",
    gstinVerified: gstRegistered && info.gstinVerified === true,
    gstRegistrationType: gstRegistered ? String(info.gstRegistrationType ?? "") : "",
    gstEffectiveDate: gstRegistered ? String(info.gstEffectiveDate ?? "") : "",
    udyamStatus: udyamVerified ? info.udyamStatus : "unverified",
    udyamNumber: udyamVerified ? String(info.udyamNumber ?? "") : "",
    udyamVerified,
    enterpriseClassification: udyamVerified ? String(info.enterpriseClassification ?? "") : "",
    maharashtraRegistrationType: maharashtraVerified ? String(info.maharashtraRegistrationType ?? "") : "",
    maharashtraIssuingAuthority: maharashtraVerified ? String(info.maharashtraIssuingAuthority ?? "") : "",
    maharashtraRegistrationIdentifier: maharashtraVerified ? String(info.maharashtraRegistrationIdentifier ?? "") : "",
    maharashtraRegistrationDate: maharashtraVerified ? String(info.maharashtraRegistrationDate ?? "") : "",
    maharashtraRegistrationStatus: maharashtraVerified ? String(info.maharashtraRegistrationStatus ?? "") : "",
    maharashtraRegistrationVerified: maharashtraVerified,
    operatingHours: info.operatingHoursVerified === true ? String(info.operatingHours ?? "") : "",
    operatingHoursVerified: info.operatingHoursVerified === true,
    customerEnquiryInstructions: String(info.customerEnquiryInstructions ?? "Contact us to discuss your requirements and request a quotation."),
    privacyContactEmail: String(info.privacyContactEmail ?? "newnationaladv2022@gmail.com"),
    customerComplaintContact: String(info.customerComplaintContact ?? "newnationaladv2022@gmail.com"),
    lastVerificationDate: "",
  };
}

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
  const value = snapshot.data() ?? defaultSettings;
  const businessInformation = publicBusinessInformation(value.businessInformation as Record<string, unknown> | undefined);
  const addressVerified = businessInformation.addressVerified;
  res.json({
    id: snapshot.id,
    businessName: value.businessName ?? defaultSettings.businessName,
    email: value.email ?? defaultSettings.email,
    address: addressVerified ? value.address : "",
    whatsappNumbers: value.whatsappNumbers ?? defaultSettings.whatsappNumbers,
    socialLinks: value.socialLinks ?? defaultSettings.socialLinks,
    googleMapsUrl: addressVerified ? value.googleMapsUrl : "",
    footerInformation: value.footerInformation ?? defaultSettings.footerInformation,
    logoPath: value.logoPath ?? defaultSettings.logoPath,
    faviconPath: value.faviconPath ?? defaultSettings.faviconPath,
    metadataTitle: value.metadataTitle ?? defaultSettings.metadataTitle,
    metadataDescription: value.metadataDescription ?? defaultSettings.metadataDescription,
    businessInformation,
  });
});

router.get("/admin/settings", requireAdmin, async (_req, res): Promise<void> => {
  await ensureCmsSeeded();
  const snapshot = await firestore().collection("websiteSettings").doc("general").get();
  res.json({ id: snapshot.id, ...defaultSettings, ...snapshot.data() });
});

router.put("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = settingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid website settings", details: parsed.error.flatten() });
    return;
  }
  const reference = firestore().collection("websiteSettings").doc("general");
  const now = new Date();
  const existing = (await reference.get()).data() ?? defaultSettings;
  const value = {
    ...existing,
    ...parsed.data,
    businessInformation: {
      ...defaultSettings.businessInformation,
      ...(existing.businessInformation ?? {}),
      ...(parsed.data.businessInformation ?? {}),
    },
    updatedAt: now,
    updatedBy: currentAdmin(res).uid,
  };
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