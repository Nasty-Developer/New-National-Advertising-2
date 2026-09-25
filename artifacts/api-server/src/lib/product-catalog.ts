import type { DocumentData } from "firebase-admin/firestore";
import { firestore } from "./firebase";

export const EXACT_PRODUCT_CATALOG_VERSION = "new-national-advertising-exact-pdf-v1";

type ProductCategory = {
  name: string;
  products: readonly string[];
};

export type ProductCatalogEntry = {
  name: string;
  category: string;
  sourceCategories: string[];
  categoryOrder: number;
  productOrder: number;
};

const sourceCatalog: readonly ProductCategory[] = [
  {
    name: "Core Printing & Branding",
    products: [
      "Flex / large-format printing",
      "Digital printing",
      "Offset printing",
      "Eco-solvent printing",
      "UV printing",
      "Flatbed UV printing",
      "Glass printing",
      "Acrylic printing",
      "Canvas printing",
      "Laser cutting",
      "Laser engraving",
      "Sublimation printing",
      "Variable-data printing",
      "Screen printing",
      "Sticker printing",
      "Label printing",
      "Brochure printing",
      "Flyer printing",
      "Poster printing",
      "Catalogue printing",
      "Letterhead printing",
      "Envelope printing",
      "Certificate printing",
      "Wedding card printing",
      "Business/visiting card printing",
      "Book/binding services",
      "Packaging printing",
    ],
  },
  {
    name: "Signage & Display",
    products: [
      "Signage",
      "Stainless-steel Signage",
      "Acrylic Signage",
      "Acrylic nameplates",
      "QR-code stands",
      "Display stands",
      "Information signage",
      "Highway/retro-reflective Signage",
      "Braille/tactile signage",
      "ACP boards",
      "Vinyl signage",
      "Sunboard signage",
      "LED-related signage",
      "Acrylic cutting",
      "Laser-cut acrylic",
      "Name plates",
      "Menu/display stands",
    ],
  },
  {
    name: "Paper & Corporate Printing",
    products: [
      "Business cards",
      "Visiting cards",
      "Spot-UV cards",
      "Gold-foil cards",
      "Letterheads",
      "Business letterheads",
      "Brochures",
      "Flyers",
      "Folded flyers",
      "Posters",
      "Indoor posters",
      "Newsletters",
      "Certificates",
      "Envelopes",
      "Business envelopes",
      "Pocket envelopes",
      "Postage envelopes",
      "Bill books",
      "Notebooks",
      "Spiral notebooks",
      "Thread-bound notebooks",
      "Books",
      "Magazines",
      "Booklets",
      "Bookmarks",
      "Conference folders",
      "Diaries",
      "Planners",
      "Calendars",
    ],
  },
  {
    name: "Labels & Stickers",
    products: [
      "Die-cut stickers",
      "Sticker sheets",
      "Brand-logo stickers",
      "Dome labels",
      "Double-sided labels",
      "Bottle labels",
      "Wine bottle labels",
      "Beer bottle labels",
      "Cosmetic labels",
      "Food-packaging labels",
      "Roll labels",
      "Classic roll labels",
      "Transparent stickers",
      "Laptop stickers",
      "Vinyl waterproof stickers",
      "PVC wall stickers",
      "Vinyl flooring stickers",
      "Designer stickers",
      "Special-finish labels",
      "Screen printing",
      "UV DTF stickers",
    ],
  },
  {
    name: "Acrylic Products",
    products: [
      "QR-code stands",
      "Acrylic display stands",
      "Acrylic trophies",
      "Acrylic cutting",
      "Acrylic name tags",
      "Acrylic name badges",
      "Acrylic keychains",
      "Acrylic sign holders",
      "Acrylic menu stands",
      "Acrylic board nameplates",
      "Acrylic night lamps",
      "Acrylic UV printing",
      "Acrylic wedding cards",
      "Acrylic badges",
    ],
  },
  {
    name: "Promotional Products",
    products: [
      "Metal ball pens",
      "Chrome pens",
      "Plastic pens",
      "Multiple-function pens",
      "LED-logo pens",
      "Screwdriver pens",
      "Mobile-stand pens",
      "Metal keychains",
      "Opener keychains",
      "Calendar keychains",
      "Photo-frame keychains",
      "Mobile-holder keychains",
      "Acrylic keychains",
      "Button badges",
      "Pin badges",
      "Metal badges",
      "Acrylic badges",
      "Name badges",
      "Magnetic badges",
      "Corporate gift sets",
      "Fridge magnets",
      "Mugs",
      "Sippers",
      "USB pen drives",
      "Umbrellas",
    ],
  },
  {
    name: "Apparel",
    products: [
      "Cotton T-shirts",
      "Polyester T-shirts",
      "Cotton/polyester mix T-shirts",
      "Polo T-shirts",
      "DTF T-shirts",
      "Vinyl-print T-shirts",
      "Caps",
      "Lanyards",
      "Printed lanyards",
      "ID lanyards",
    ],
  },
  {
    name: "Food / Hospitality Packaging",
    products: [
      "Paper placemats",
      "Catering trays",
      "Food containers",
      "Flip-lid food boxes",
      "Deluxe food boxes",
      "Sandwich boxes",
      "Sales-kit boxes",
      "Bottle boxes",
      "Glass-bottle boxes",
      "Waterproof food stickers",
      "Packaging labels",
    ],
  },
  {
    name: "Events & Wedding",
    products: [
      "Wedding cards",
      "Designer wedding cards",
      "Engagement invitations",
      "Baby-shower cards",
      "Bridal-shower invitations",
      "Pregnancy announcement cards",
      "Birth announcement cards",
      "Save-the-date cards",
      "Acrylic wedding cards",
      "Event ID cards",
      "Event badges",
    ],
  },
  {
    name: "Awards & Recognition",
    products: [
      "Crystal trophies",
      "Corporate trophies",
      "Acrylic trophies",
      "Trophy printing",
      "Award trophies",
      "Name badges",
      "Metal badges",
      "Acrylic badges",
    ],
  },
  {
    name: "Office / Corporate Utility",
    products: [
      "Corporate stationery",
      "ID cards",
      "RFID cards",
      "Loyalty cards",
      "PVC cards",
      "Visiting-card holders",
      "Conference folders",
      "Diaries",
      "Planners",
      "Sticky-note kits",
      "Desktop stationery kits",
      "Corporate trophies",
      "Desk clocks",
      "Calendar products",
    ],
  },
  {
    name: "Specialized Products",
    products: [
      "Mouse pads",
      "Gaming mats",
      "Fridge magnets",
      "Canvas bags",
      "Aluminium sublimation sheets",
      "Vitrified tile printing",
      "Tile printing",
      "Neodymium magnets",
      "Stainless-steel nameplates",
      "Stainless-steel sippers",
      "Coffee mugs",
      "QR stands",
      "Scratch cards",
      "USB drives",
      "Canvas printing",
    ],
  },
] as const;

function normalizeProductName(name: string) {
  return /sign\s*board/i.test(name) ? "Signage" : name;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildCatalogEntries() {
  const entries = new Map<string, ProductCatalogEntry>();
  sourceCatalog.forEach((category, categoryOrder) => {
    category.products.forEach((rawName, productOrder) => {
      const name = normalizeProductName(rawName);
      const existing = entries.get(name);
      if (existing) {
        if (!existing.sourceCategories.includes(category.name)) {
          existing.sourceCategories.push(category.name);
        }
        return;
      }
      entries.set(name, {
        name,
        category: category.name,
        sourceCategories: [category.name],
        categoryOrder,
        productOrder,
      });
    });
  });
  return [...entries.values()];
}

export const exactProductCatalog = buildCatalogEntries();
export const exactProductCatalogCategoryCount = sourceCatalog.length;
export const exactProductCatalogListedCount = sourceCatalog.reduce(
  (total, category) => total + category.products.length,
  0,
);
export const exactProductCatalogDuplicateCount =
  exactProductCatalogListedCount - exactProductCatalog.length;

let migrationPromise: Promise<void> | undefined;

function productRecord(entry: ProductCatalogEntry, now: Date): DocumentData {
  const description = `${entry.name} services and products from New National Advertising.`;
  return {
    name: entry.name,
    slug: slugify(entry.name),
    shortDescription: description,
    description,
    fullDescription: description,
    imagePath: null,
    imageUrl: null,
    imageAlt: null,
    category: entry.category,
    catalogCategories: entry.sourceCategories,
    serviceSlug: null,
    price: null,
    status: "published",
    stockStatus: "in_stock",
    displayOrder: entry.categoryOrder * 1000 + entry.productOrder,
    featured: false,
    createdAt: now,
    updatedAt: now,
    createdBy: "exact-product-catalog-import",
    updatedBy: "exact-product-catalog-import",
  };
}

async function migrateExactProductCatalog() {
  const metadata = firestore()
    .collection("catalogMetadata")
    .doc("products-exact-pdf");
  const currentVersion = await metadata.get();
  if (currentVersion.exists && currentVersion.data()?.version === EXACT_PRODUCT_CATALOG_VERSION) {
    return;
  }

  const productCollection = firestore().collection("products");
  const existing = await productCollection.get();
  const now = new Date();

  await Promise.all(
    existing.docs.map(async (doc) => {
      const backupId = `${EXACT_PRODUCT_CATALOG_VERSION}-${doc.id}`.replace(
        /[^a-zA-Z0-9_-]/g,
        "-",
      );
      await firestore()
        .collection("productCatalogBackups")
        .doc(backupId)
        .set({
          originalProductId: doc.id,
          sourceVersion: EXACT_PRODUCT_CATALOG_VERSION,
          backedUpAt: now,
          record: doc.data(),
        });
    }),
  );

  await Promise.all(existing.docs.map((doc) => productCollection.doc(doc.id).delete()));

  await Promise.all(
    exactProductCatalog.map((entry) =>
      productCollection
        .doc(`catalog-${slugify(entry.name)}`)
        .set(productRecord(entry, now)),
    ),
  );

  await metadata.set({
    version: EXACT_PRODUCT_CATALOG_VERSION,
    source: "New National Advertising Exact Products Catalog Import & Replit Implementation Prompt",
    categoryCount: exactProductCatalogCategoryCount,
    listedProductCount: exactProductCatalogListedCount,
    uniqueProductCount: exactProductCatalog.length,
    duplicateOccurrencesAvoided: exactProductCatalogDuplicateCount,
    imagesEmpty: true,
    migratedAt: now,
  });
}

export async function ensureExactProductCatalog() {
  migrationPromise ??= migrateExactProductCatalog();
  await migrationPromise;
}