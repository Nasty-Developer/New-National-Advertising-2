import { and, asc, count, countDistinct, desc, eq, ilike, or } from "drizzle-orm";
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
import { db, productsTable } from "@workspace/db";
import { requireAdmin } from "./admin";

const router: IRouter = Router();

function productValues(data: {
  name: string;
  shortDescription: string;
  fullDescription: string;
  imagePath?: string | null;
  imageAlt?: string | null;
  category: string;
  price?: number | null;
  status: "draft" | "published" | "inactive";
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  displayOrder?: number;
}) {
  return {
    name: data.name.trim(),
    shortDescription: data.shortDescription.trim(),
    fullDescription: data.fullDescription.trim(),
    imagePath: data.imagePath ?? null,
    imageAlt: data.imageAlt?.trim() || null,
    category: data.category.trim(),
    price: data.price ?? null,
    status: data.status,
    stockStatus: data.stockStatus,
    displayOrder: data.displayOrder ?? 0,
  };
}

router.get("/products", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.status, "published"))
    .orderBy(asc(productsTable.displayOrder), desc(productsTable.updatedAt));
  res.json(GetPublicProductsResponse.parse(products));
});

router.get("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = GetAdminProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product filters" });
    return;
  }

  const conditions = [];
  if (parsed.data.search) {
    const query = `%${parsed.data.search}%`;
    conditions.push(or(ilike(productsTable.name, query), ilike(productsTable.category, query)));
  }
  if (parsed.data.category) conditions.push(eq(productsTable.category, parsed.data.category));
  if (parsed.data.status) conditions.push(eq(productsTable.status, parsed.data.status));
  if (parsed.data.stockStatus) conditions.push(eq(productsTable.stockStatus, parsed.data.stockStatus));

  const orderBy = parsed.data.sort === "name"
    ? asc(productsTable.name)
    : parsed.data.sort === "displayOrder"
      ? asc(productsTable.displayOrder)
      : desc(productsTable.updatedAt);

  const products = await db
    .select()
    .from(productsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy, asc(productsTable.id));
  res.json(GetAdminProductsResponse.parse(products));
});

router.post("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product details", details: parsed.error.flatten() });
    return;
  }
  const [product] = await db.insert(productsTable).values(productValues(parsed.data)).returning();
  res.status(201).json(CreateProductResponse.parse(product));
});

router.get("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetAdminProductResponse.parse(product));
});

router.put("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid product details" });
    return;
  }
  const [product] = await db
    .update(productsTable)
    .set({ ...productValues(parsed.data), updatedAt: new Date() })
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(UpdateProductResponse.parse(product));
});

router.delete("/admin/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }
  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/admin/summary", requireAdmin, async (_req, res): Promise<void> => {
  const [totals] = await db.select({ total: count() }).from(productsTable);
  const [published] = await db.select({ total: count() }).from(productsTable).where(eq(productsTable.status, "published"));
  const [draft] = await db.select({ total: count() }).from(productsTable).where(eq(productsTable.status, "draft"));
  const [inactive] = await db.select({ total: count() }).from(productsTable).where(eq(productsTable.status, "inactive"));
  const [categories] = await db.select({ total: countDistinct(productsTable.category) }).from(productsTable);

  res.json(GetAdminSummaryResponse.parse({
    totalProducts: Number(totals?.total ?? 0),
    publishedProducts: Number(published?.total ?? 0),
    draftProducts: Number(draft?.total ?? 0),
    inactiveProducts: Number(inactive?.total ?? 0),
    categories: Number(categories?.total ?? 0),
  }));
});

export default router;