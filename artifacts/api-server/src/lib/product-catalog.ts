import type { DocumentData } from "firebase-admin/firestore";
import { firestore } from "./firebase";

<<<<<<< HEAD
export const EXACT_PRODUCT_CATALOG_VERSION = "new-national-advertising-exact-pdf-v8";

const providedProductImagePaths: Readonly<Record<string, string>> = {
  "Bill books": "/product-images/paper-corporate/bill-books.png",
  Booklets: "/product-images/paper-corporate/booklets.jpg",
  Bookmarks: "/product-images/paper-corporate/bookmarks.jpg",
  Books: "/product-images/paper-corporate/books.jpg",
  Brochures: "/product-images/paper-corporate/brochures.jpg",
  "Business cards": "/product-images/paper-corporate/business-cards.webp",
  "Business envelopes": "/product-images/paper-corporate/business-envelopes.jpg",
  "Business letterheads": "/product-images/paper-corporate/business-letterheads.jpg",
  Calendars: "/product-images/paper-corporate/calendars.jpg",
  Certificates: "/product-images/paper-corporate/certificates.jpg",
  "Conference folders": "/product-images/paper-corporate/conference-folders.jpg",
  Diaries: "/product-images/paper-corporate/diaries.jpg",
  Envelopes: "/product-images/paper-corporate/envelopes.jpg",
  Flyers: "/product-images/paper-corporate/flyers.jpg",
  "Folded flyers": "/product-images/paper-corporate/folded-flyers.jpg",
  "Gold-foil cards": "/product-images/paper-corporate/gold-foil-cards.jpg",
  "Indoor posters": "/product-images/paper-corporate/indoor-posters.jpg",
  Letterheads: "/product-images/paper-corporate/letterheads.jpg",
  Magazines: "/product-images/paper-corporate/magazines.jpg",
  Newsletters: "/product-images/paper-corporate/newsletters.jpg",
  Notebooks: "/product-images/paper-corporate/notebooks.jpg",
  Planners: "/product-images/paper-corporate/planners.jpg",
  "Pocket envelopes": "/product-images/paper-corporate/pocket-envelopes.jpg",
  "Postage envelopes": "/product-images/paper-corporate/postage-envelopes.jpg",
  Posters: "/product-images/paper-corporate/posters.jpg",
  "Spiral notebooks": "/product-images/paper-corporate/spiral-notebooks.jpg",
  "Spot-UV cards": "/product-images/paper-corporate/spot-uv-cards.jpg",
  "Thread-bound notebooks": "/product-images/paper-corporate/thread-bound-notebooks.jpg",
  "Visiting cards": "/product-images/paper-corporate/visiting-cards.jpg",
  "Acrylic wedding cards": "/product-images/events-wedding/acrylic-wedding-cards.jpg",
  "Baby-shower cards": "/product-images/events-wedding/baby-shower-cards.jpg",
  "Birth announcement cards": "/product-images/events-wedding/birth-announcement-cards.jpg",
  "Bridal-shower invitations": "/product-images/events-wedding/bridal-shower-invitations.jpg",
  "Designer wedding cards": "/product-images/events-wedding/designer-wedding-cards.jpg",
  "Engagement invitations": "/product-images/events-wedding/engagement-invitations.jpg",
  "Event badges": "/product-images/events-wedding/event-badges.jpg",
  "Event ID cards": "/product-images/events-wedding/event-id-cards.jpg",
  "Pregnancy announcement cards": "/product-images/events-wedding/pregnancy-announcement-cards.jpg",
  "Save-the-date cards": "/product-images/events-wedding/save-the-date-cards.jpg",
  "Wedding cards": "/product-images/events-wedding/wedding-cards.jpg",
  "Acrylic badges": "/product-images/promotional-products/acrylic-badges.jpg",
  "Acrylic keychains": "/product-images/promotional-products/acrylic-keychains.jpg",
  "Button badges": "/product-images/promotional-products/button-badges.jpg",
  "Calendar keychains": "/product-images/promotional-products/calendar-keychains.jpg",
  "Chrome pens": "/product-images/promotional-products/chrome-pens.jpg",
  "Corporate gift sets": "/product-images/promotional-products/corporate-gift-sets.jpg",
  "Fridge magnets": "/product-images/promotional-products/fridge-magnets.jpg",
  "LED-logo pens": "/product-images/promotional-products/led-logo-pens.jpg",
  "Magnetic badges": "/product-images/promotional-products/magnetic-badges.jpg",
  "Metal badges": "/product-images/promotional-products/metal-badges.jpg",
  "Metal ball pens": "/product-images/promotional-products/metal-ball-pens.jpg",
  "Metal keychains": "/product-images/promotional-products/metal-keychains.jpg",
  "Mobile-holder keychains": "/product-images/promotional-products/mobile-holder-keychains.jpg",
  "Mobile-stand pens": "/product-images/promotional-products/mobile-stand-pens.jpg",
  Mugs: "/product-images/promotional-products/mugs.jpg",
  "Multiple-function pens": "/product-images/promotional-products/multiple-function-pens.jpg",
  "Name badges": "/product-images/promotional-products/name-badges.jpg",
  "Opener keychains": "/product-images/promotional-products/opener-keychains.jpg",
  "Photo-frame keychains": "/product-images/promotional-products/photo-frame-keychains.jpg",
  "Pin badges": "/product-images/promotional-products/pin-badges.jpg",
  "Plastic pens": "/product-images/promotional-products/plastic-pens.jpg",
  "Screwdriver pens": "/product-images/promotional-products/screwdriver-pens.jpg",
  Sippers: "/product-images/promotional-products/sippers.jpg",
  Umbrellas: "/product-images/promotional-products/umbrellas.jpg",
  "USB pen drives": "/product-images/promotional-products/usb-pen-drives.jpg",
=======
export const EXACT_PRODUCT_CATALOG_VERSION = "new-national-advertising-exact-pdf-v3";

const providedProductImagePaths: Readonly<Record<string, string>> = {
>>>>>>> origin/main
  "Beer bottle labels": "/product-images/labels-stickers/beer-bottle-labels.jpg",
  "Bottle labels": "/product-images/labels-stickers/bottle-labels.jpg",
  "Brand-logo stickers": "/product-images/labels-stickers/brand-logo-stickers.jpg",
  "Classic roll labels": "/product-images/labels-stickers/classic-roll-labels.jpg",
  "Cosmetic labels": "/product-images/labels-stickers/cosmetic-labels.jpg",
  "Designer stickers": "/product-images/labels-stickers/designer-stickers.jpg",
  "Die-cut stickers": "/product-images/labels-stickers/die-cut-stickers.jpg",
  "Dome labels": "/product-images/labels-stickers/dome-labels.jpg",
  "Double-sided labels": "/product-images/labels-stickers/double-sided-labels.jpg",
  "Food-packaging labels": "/product-images/labels-stickers/food-packaging-labels.jpg",
  "Laptop stickers": "/product-images/labels-stickers/laptop-stickers.jpg",
  "PVC wall stickers": "/product-images/labels-stickers/pvc-wall-stickers.jpg",
  "Roll labels": "/product-images/labels-stickers/roll-labels.jpg",
  "Screen printing": "/product-images/labels-stickers/screen-printing.jpg",
  "Special-finish labels": "/product-images/labels-stickers/special-finish-labels.jpg",
  "Sticker sheets": "/product-images/labels-stickers/sticker-sheets.jpg",
  "Transparent stickers": "/product-images/labels-stickers/transparent-stickers.jpg",
  "UV DTF stickers": "/product-images/labels-stickers/uv-dtf-stickers.jpg",
  "Vinyl flooring stickers": "/product-images/labels-stickers/vinyl-flooring-stickers.jpg",
  "Vinyl waterproof stickers": "/product-images/labels-stickers/vinyl-waterproof-stickers.jpg",
  "Wine bottle labels": "/product-images/labels-stickers/wine-bottle-labels.jpg",
};

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
      "Stainless-steel sign boards",
      "Acrylic sign boards",
      "Acrylic nameplates",
      "QR-code stands",
      "Display stands",
      "Information signs",
      "Highway/retro-reflective sign boards",
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
      const key = `${category.name}\u0000${rawName}`;
      entries.set(key, {
        name: rawName,
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
    imagePath: providedProductImagePaths[entry.name] ?? null,
    imageUrl: providedProductImagePaths[entry.name] ?? null,
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

function catalogKey(name: unknown, category: unknown) {
  return `${String(category ?? "").trim()}\u0000${String(name ?? "").trim()}`;
}

function catalogDocumentId(entry: ProductCatalogEntry) {
  return `catalog-${slugify(entry.category)}-${slugify(entry.name)}`;
}

function isManagedCatalogRecord(id: string, data: DocumentData) {
  return id.startsWith("catalog-") && data.createdBy === "exact-product-catalog-import";
}

export function isExactProductCatalogRecord(id: string, data: DocumentData) {
  return isManagedCatalogRecord(id, data);
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
  const existingManagedByKey = new Map<
    string,
    { id: string; data: DocumentData }
  >();
  for (const doc of existing.docs) {
    const data = doc.data();
    if (isManagedCatalogRecord(doc.id, data)) {
      existingManagedByKey.set(catalogKey(data.name, data.category), {
        id: doc.id,
        data,
      });
    }
  }

  const retainedIds = new Set<string>();
  await Promise.all(
    exactProductCatalog.map(async (entry) => {
      const existingRecord = existingManagedByKey.get(
        catalogKey(entry.name, entry.category),
      );
      const reference = existingRecord
        ? productCollection.doc(existingRecord.id)
        : productCollection.doc(catalogDocumentId(entry));
      const previous = existingRecord?.data;
      await reference.set({
        ...productRecord(entry, now),
        imagePath: providedProductImagePaths[entry.name] ?? previous?.imagePath ?? null,
        imageUrl: providedProductImagePaths[entry.name] ?? previous?.imageUrl ?? null,
        imageAlt: previous?.imageAlt ?? null,
        serviceSlug: previous?.serviceSlug ?? null,
        price: previous?.price ?? null,
        status: previous?.status ?? "published",
        stockStatus: previous?.stockStatus ?? "in_stock",
        featured: previous?.featured ?? false,
        createdAt: previous?.createdAt ?? now,
        createdBy: previous?.createdBy ?? "exact-product-catalog-import",
      });
      retainedIds.add(reference.id);
    }),
  );

  await Promise.all(
    existing.docs
      .filter((doc) => isManagedCatalogRecord(doc.id, doc.data()) && !retainedIds.has(doc.id))
      .map((doc) => productCollection.doc(doc.id).delete()),
  );

  await metadata.set({
    version: EXACT_PRODUCT_CATALOG_VERSION,
    source: "New National Advertising Exact Products Catalog Import & Replit Implementation Prompt",
    categoryCount: exactProductCatalogCategoryCount,
    listedProductCount: exactProductCatalogListedCount,
    uniqueProductCount: exactProductCatalog.length,
    duplicateOccurrencesAvoided: exactProductCatalogDuplicateCount,
     imagesEmpty: false,
    migratedAt: now,
  });
}

export async function ensureExactProductCatalog() {
  migrationPromise ??= migrateExactProductCatalog();
  await migrationPromise;
}