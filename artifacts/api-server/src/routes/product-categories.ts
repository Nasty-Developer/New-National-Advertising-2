import { Router, type IRouter } from "express";
import {
  GetProductCategoriesResponse,
  UpdateAdminProductCategoryBody,
  UpdateAdminProductCategoryParams,
  UpdateAdminProductCategoryResponse,
} from "@workspace/api-zod";
import { currentAdmin, requireAdmin } from "../lib/firebase-auth";
import { firestore } from "../lib/firebase";
import {
  createFirebaseImageDownloadUrl,
  deleteFirebaseProductImageIfUnreferenced,
  normalizeFirebaseCategoryImagePath,
} from "../lib/firebase-storage";

const router: IRouter = Router();
const productCategories = () => firestore().collection("productCategories");

const PRODUCT_CATEGORIES = [
  { id: "core-printing-branding", name: "CORE PRINTING & BRANDING" },
  { id: "signage-display", name: "SIGNAGE & DISPLAY" },
  { id: "paper-corporate-printing", name: "PAPER & CORPORATE PRINTING" },
  { id: "labels-stickers", name: "LABELS & STICKERS" },
  { id: "acrylic-products", name: "ACRYLIC PRODUCTS" },
  { id: "promotional-products", name: "PROMOTIONAL PRODUCTS" },
  { id: "apparel", name: "APPAREL" },
  { id: "food-hospitality-packaging", name: "FOOD / HOSPITALITY PACKAGING" },
  { id: "events-wedding", name: "EVENTS & WEDDING" },
  { id: "awards-recognition", name: "AWARDS & RECOGNITION" },
  { id: "office-corporate-utility", name: "OFFICE / CORPORATE UTILITY" },
  { id: "specialized-products", name: "SPECIALIZED PRODUCTS" },
] as const;

const categoriesById = new Map<string, (typeof PRODUCT_CATEGORIES)[number] & { displayOrder: number }>(PRODUCT_CATEGORIES.map((category, displayOrder) => [
  category.id,
  { ...category, displayOrder },
]));

function alreadyExists(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  const code = (error as { code?: unknown }).code;
  return code === "already-exists" || code === 6 || code === "6";
}

async function ensureProductCategories(): Promise<void> {
  const collection = productCategories();
  await Promise.all(PRODUCT_CATEGORIES.map(async (category, displayOrder) => {
    const now = new Date();
    try {
      await collection.doc(category.id).create({
        categoryId: category.id,
        categoryName: category.name,
        categoryImagePath: null,
        categoryImageUrl: null,
        categoryImageAlt: null,
        active: true,
        displayOrder,
        createdAt: now,
        updatedAt: now,
        createdBy: "catalog-seed",
        updatedBy: "catalog-seed",
      });
    } catch (error) {
      if (!alreadyExists(error)) throw error;
    }
  }));
}

function toDate(value: unknown): Date {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

async function productCategoryResponse(
  categoryId: string,
  categoryName: string,
  displayOrder: number,
  data: Record<string, unknown>,
) {
  const categoryImagePath =
    normalizeFirebaseCategoryImagePath(data.categoryImagePath ?? data.categoryImageUrl) ?? null;
  const storedUrl = typeof data.categoryImageUrl === "string" ? data.categoryImageUrl : null;
  const storedUrlPath = normalizeFirebaseCategoryImagePath(storedUrl);
  let categoryImageUrl: string | null = null;

  if (categoryImagePath) {
    if (storedUrl && storedUrlPath === categoryImagePath && /[?&]token=/.test(storedUrl)) {
      categoryImageUrl = storedUrl;
    } else {
      try {
        categoryImageUrl = await createFirebaseImageDownloadUrl(
          categoryImagePath,
          "category-images",
        );
      } catch {
        categoryImageUrl = null;
      }
    }
  }

  return {
    categoryId,
    categoryName,
    categoryImagePath,
    categoryImageUrl,
    categoryImageAlt:
      categoryImagePath && typeof data.categoryImageAlt === "string"
        ? data.categoryImageAlt
        : null,
    active: data.active !== false,
    displayOrder,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

async function getProductCategoryRows() {
  await ensureProductCategories();
  const snapshot = await productCategories().get();
  const documents = new Map(snapshot.docs.map((doc) => [doc.id, doc.data()]));

  return Promise.all(PRODUCT_CATEGORIES.map(({ id, name }, displayOrder) =>
    productCategoryResponse(
      id,
      name,
      displayOrder,
      documents.get(id) ?? {},
    ),
  ));
}

router.get("/product-categories", async (_req, res): Promise<void> => {
  res.json(GetProductCategoriesResponse.parse(await getProductCategoryRows()));
});

router.put(
  "/admin/product-categories/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateAdminProductCategoryParams.safeParse(req.params);
    const parsed = UpdateAdminProductCategoryBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res.status(400).json({ error: "Invalid category image details" });
      return;
    }

    const category = categoriesById.get(params.data.id);
    if (!category) {
      res.status(404).json({ error: "Product category not found" });
      return;
    }

    await ensureProductCategories();
    const reference = productCategories().doc(category.id);
    const snapshot = await reference.get();
    const previous = snapshot.data() ?? {};
    const previousImagePath =
      normalizeFirebaseCategoryImagePath(previous.categoryImagePath ?? previous.categoryImageUrl);
    const categoryImagePath = parsed.data.categoryImagePath
      ? normalizeFirebaseCategoryImagePath(parsed.data.categoryImagePath)
      : null;

    if (parsed.data.categoryImagePath && !categoryImagePath) {
      res.status(400).json({ error: "Use an uploaded image from the category-images folder." });
      return;
    }

    const admin = currentAdmin(res);
    const now = new Date();
    let categoryImageUrl: string | null = null;
    if (categoryImagePath) {
      const previousImageUrl =
        typeof previous.categoryImageUrl === "string" ? previous.categoryImageUrl : "";
      if (
        previousImagePath === categoryImagePath &&
        /^https?:\/\//i.test(previousImageUrl) &&
        /[?&]token=/.test(previousImageUrl)
      ) {
        categoryImageUrl = previousImageUrl;
      } else {
        try {
          categoryImageUrl = await createFirebaseImageDownloadUrl(
            categoryImagePath,
            "category-images",
          );
        } catch (error) {
          req.log.warn({ err: error }, "Could not verify uploaded category image");
          res.status(422).json({
            error: "The category image could not be verified in Firebase Storage. Please upload it again.",
          });
          return;
        }
      }
    }
    const values = {
      categoryId: category.id,
      categoryName: category.name,
      categoryImagePath,
      categoryImageUrl,
      categoryImageAlt: categoryImagePath
        ? parsed.data.categoryImageAlt?.trim() || category.name
        : null,
      active: true,
      displayOrder: category.displayOrder,
      createdAt: previous.createdAt ?? now,
      updatedAt: now,
      createdBy: previous.createdBy ?? admin.uid,
      updatedBy: admin.uid,
    };

    await reference.set(values, { merge: true });

    if (previousImagePath && previousImagePath !== categoryImagePath) {
      await deleteFirebaseProductImageIfUnreferenced(previousImagePath);
    }

    res.json(UpdateAdminProductCategoryResponse.parse(
      await productCategoryResponse(category.id, category.name, category.displayOrder, values),
    ));
  },
);

export default router;