import { Router, type IRouter } from "express";
import {
  CreateProductBody,
  CreateProductResponse,
  DeleteProductParams,
  GetAdminProductParams,
  GetAdminProductResponse,
  GetAdminProductsQueryParams,
  GetAdminProductsResponse,
  GetAdminSummaryResponse,
  GetPublicProductsResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
} from "@workspace/api-zod";
import type { DocumentData } from "firebase-admin/firestore";
import { currentAdmin, requireAdmin } from "../lib/firebase-auth";
import { mediaReference } from "../lib/cloudinary-storage";
import { firestore } from "../lib/firebase";
import { ensureExactProductCatalog, isExactProductCatalogRecord } from "../lib/product-catalog";

const router: IRouter = Router();
const products = () => firestore().collection("products");
const productPriority = [
  new Set(["signage"]),
  new Set(["banner"]),
  new Set(["brochure", "brochure printing", "brochures"]),
  new Set(["acrylic clip-on board"]),
  new Set(["calendar", "calendars"]),
  new Set(["business card", "business cards", "business/visiting card printing"]),
  new Set(["letterhead", "letterhead printing", "letterheads", "business letterheads"]),
  new Set(["hoarding banner"]),
];

function productPriorityRank(name: string) {
  const normalized = name.toLowerCase().trim().replace(/\s+/g, " ");
  const index = productPriority.findIndex((names) => names.has(normalized));
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}

function productOrder(
  left: { id: string; name: string; displayOrder: number; updatedAt: Date },
  right: { id: string; name: string; displayOrder: number; updatedAt: Date },
) {
  return productPriorityRank(left.name) - productPriorityRank(right.name)
    || Number(left.displayOrder) - Number(right.displayOrder)
    || right.updatedAt.getTime() - left.updatedAt.getTime()
    || left.name.localeCompare(right.name)
    || left.id.localeCompare(right.id);
}

function toDate(value: unknown): Date {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

async function productResponse(id: string, data: DocumentData) {
  const storedImagePath = data.imagePath ?? data.imageUrl ?? null;
  const imagePath = mediaReference(storedImagePath) ?? storedImagePath;
  const storedImageUrl =
    typeof data.imageUrl === "string" && data.imageUrl
      ? data.imageUrl
      : null;
  const imageUrl = storedUrlIsStable(storedImageUrl)
    ? storedImageUrl
    : typeof imagePath === "string"
      ? imagePath
      : null;

  return {
    id,
    name: String(data.name ?? ""),
    shortDescription: String(data.shortDescription ?? ""),
    fullDescription: String(data.fullDescription ?? data.description ?? ""),
    imagePath,
    imageUrl,
    imageAlt: data.imageAlt ?? null,
    category: String(data.category ?? ""),
    serviceSlug: data.serviceSlug ?? null,
    price: data.price === undefined || data.price === null ? null : Number(data.price),
    status: data.status ?? "draft",
    stockStatus: data.stockStatus ?? "in_stock",
    displayOrder: Number(data.displayOrder ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function storedUrlIsStable(value: string | null): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

async function allProducts() {
  await ensureExactProductCatalog();
  const snapshot = await products().get();
  return Promise.all(snapshot.docs
    .filter((doc) => isExactProductCatalogRecord(doc.id, doc.data()))
    .map(async (doc) => ({
    doc,
    value: await productResponse(doc.id, doc.data()),
  })));
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function productValues(data: {
  name: string;
  shortDescription: string;
  fullDescription: string;
  imagePath?: string | null;
  imageAlt?: string | null;
  category: string;
  serviceSlug?: string | null;
  price?: number | null;
  status: "draft" | "published" | "archived";
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  displayOrder?: number;
}, uid: string, previousData?: DocumentData) {
  const now = new Date();
  const previousImageValue = previousData?.imagePath ?? previousData?.imageUrl;
  const submittedImagePath = data.imagePath?.trim() || null;
  const normalizedImagePath = submittedImagePath
    ? mediaReference(submittedImagePath)
    : null;
  const previousNormalizedImagePath = mediaReference(previousImageValue);
  const isUnchangedImage =
    submittedImagePath === previousNormalizedImagePath ||
    submittedImagePath === previousImageValue;
  const imagePath = submittedImagePath
    ? normalizedImagePath ?? (isUnchangedImage ? submittedImagePath : null)
    : null;
  if (submittedImagePath && !imagePath) {
    throw new Error("Upload a product image from the product editor before saving.");
  }
  const existingImageUrl =
    typeof previousData?.imageUrl === "string" ? previousData.imageUrl.trim() : "";
  const imageUrl = imagePath
    ? isUnchangedImage && storedUrlIsStable(existingImageUrl)
      ? existingImageUrl
      : imagePath
    : null;
  return {
    name: data.name.trim(),
    slug: slugify(data.name),
    shortDescription: data.shortDescription.trim(),
    description: data.fullDescription.trim(),
    fullDescription: data.fullDescription.trim(),
    imagePath,
    imageUrl,
    imageAlt: data.imageAlt?.trim() || null,
    category: data.category.trim(),
    serviceSlug: data.serviceSlug?.trim() || null,
    price: data.price ?? null,
    status: data.status,
    stockStatus: data.stockStatus,
    displayOrder: data.displayOrder ?? 0,
    featured: false,
    createdAt: now,
    updatedAt: now,
    createdBy: uid,
    updatedBy: uid,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  let rows = (await allProducts())
    .filter(({ doc }) => doc.data().status === "published")
    .sort((a, b) => productOrder(a.value, b.value));
  if (category) {
    rows = rows.filter(({ value }) => value.category === category);
  }
  res.json(GetPublicProductsResponse.parse(rows.map(({ value }) => value)));
});

router.get("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = GetAdminProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product filters" });
    return;
  }
  const query = parsed.data;
  let rows = await allProducts();
  if (query.search) {
    const term = query.search.toLowerCase();
    rows = rows.filter(({ value }) => [value.name, value.category, value.shortDescription, value.fullDescription].some((item) => item.toLowerCase().includes(term)));
  }
  if (query.category) rows = rows.filter(({ value }) => value.category === query.category);
  if (query.status) rows = rows.filter(({ value }) => value.status === query.status);
  if (query.stockStatus) rows = rows.filter(({ value }) => value.stockStatus === query.stockStatus);
  rows.sort((a, b) => query.sort === "name"
    ? a.value.name.localeCompare(b.value.name)
    : query.sort === "displayOrder"
      ? productOrder(a.value, b.value)
      : b.value.updatedAt.getTime() - a.value.updatedAt.getTime());
  res.json(GetAdminProductsResponse.parse(rows.map(({ value }) => value)));
});

router.post("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product details", details: parsed.error.flatten() });
    return;
  }
  if (parsed.data.imagePath && !mediaReference(parsed.data.imagePath)) {
    res.status(400).json({ error: "Upload product images through the product editor before saving." });
    return;
  }
  const admin = currentAdmin(res);
  const reference = products().doc();
  let values: Awaited<ReturnType<typeof productValues>>;
  try {
    values = await productValues(parsed.data, admin.uid);
  } catch (error) {
    req.log.warn({ err: error }, "Could not verify uploaded product image");
    res.status(422).json({ error: "The product image could not be verified in Cloudinary. Please upload it again." });
    return;
  }
  await reference.set(values);
  res.status(201).json(CreateProductResponse.parse(await productResponse(reference.id, (await reference.get()).data()!)));
});

router.get("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }
  const snapshot = await products().doc(params.data.id).get();
  if (!snapshot.exists) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetAdminProductResponse.parse(await productResponse(snapshot.id, snapshot.data()!)));
});

router.put("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid product details" });
    return;
  }
  const reference = products().doc(params.data.id);
  const snapshot = await reference.get();
  if (!snapshot.exists) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const admin = currentAdmin(res);
  const previousImagePath = snapshot.data()?.imagePath ?? snapshot.data()?.imageUrl;
  if (
    parsed.data.imagePath &&
    !mediaReference(parsed.data.imagePath) &&
    parsed.data.imagePath !== previousImagePath
  ) {
    res.status(400).json({ error: "Upload product images through the product editor before saving." });
    return;
  }
  let values: Awaited<ReturnType<typeof productValues>>;
  try {
    values = await productValues(parsed.data, admin.uid, snapshot.data());
  } catch (error) {
    req.log.warn({ err: error }, "Could not verify uploaded product image");
    res.status(422).json({ error: "The product image could not be verified in Cloudinary. Please upload it again." });
    return;
  }
  await reference.set({
    ...values,
    createdAt: snapshot.data()?.createdAt ?? new Date(),
    createdBy: snapshot.data()?.createdBy ?? admin.uid,
  }, { merge: true });
  res.json(UpdateProductResponse.parse(await productResponse(reference.id, (await reference.get()).data()!)));
});

router.delete("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }
  const reference = products().doc(params.data.id);
  const snapshot = await reference.get();
  if (!snapshot.exists) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  await reference.set({ status: "archived", updatedAt: new Date(), updatedBy: currentAdmin(res).uid }, { merge: true });
  res.sendStatus(204);
});

router.get("/admin/summary", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await allProducts();
  const categories = new Set(rows.map(({ value }) => value.category));
  const [machines, services, projectsSnapshot, quoteRequests, contactRequests] = await Promise.all([
    firestore().collection("machines").get(),
    firestore().collection("services").get(),
    firestore().collection("projects").get(),
    firestore().collection("quoteRequests").get(),
    firestore().collection("contactRequests").get(),
  ]);
  res.json(GetAdminSummaryResponse.parse({
    totalProducts: rows.length,
    publishedProducts: rows.filter(({ value }) => value.status === "published").length,
    draftProducts: rows.filter(({ value }) => value.status === "draft").length,
    archivedProducts: rows.filter(({ value }) => value.status === "archived").length,
    categories: categories.size,
    totalMachines: machines.size,
    totalServices: services.size,
    totalProjects: projectsSnapshot.docs.filter((doc) => doc.data().deleted !== true).length,
    totalRequests: quoteRequests.size + contactRequests.size,
  }));
});

export default router;