import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { DocumentData } from "firebase-admin/firestore";

type LocalRecord = DocumentData;
type LocalDatabase = Record<string, Record<string, LocalRecord>>;

type SetOptions = {
  merge?: boolean;
};

export type LocalDocumentSnapshot = {
  id: string;
  exists: boolean;
  data(): DocumentData;
};

export type LocalQuerySnapshot = {
  docs: LocalDocumentSnapshot[];
  empty: boolean;
  size: number;
};

export type LocalFirestore = {
  collection(name: string): LocalCollectionReference;
};

const databasePath =
  process.env.LOCAL_DATA_PATH ??
  join(process.cwd(), ".data", "new-national-advertising.json");

let database: LocalDatabase | undefined;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadDatabase(): LocalDatabase {
  if (database) return database;

  try {
    database = JSON.parse(readFileSync(databasePath, "utf8")) as LocalDatabase;
  } catch {
    database = {};
  }

  return database;
}

function saveDatabase() {
  const current = loadDatabase();
  mkdirSync(dirname(databasePath), { recursive: true });
  const temporaryPath = `${databasePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(current, null, 2));
  renameSync(temporaryPath, databasePath);
}

function collectionRecords(name: string) {
  const current = loadDatabase();
  current[name] ??= {};
  return current[name];
}

function snapshot(id: string, value: LocalRecord | undefined): LocalDocumentSnapshot {
  return {
    id,
    exists: value !== undefined,
    data: () => (value === undefined ? {} : clone(value)),
  };
}

class LocalQuery {
  constructor(
    protected readonly collectionName: string,
    private readonly sortField?: string,
    private readonly sortDirection: "asc" | "desc" = "asc",
    private readonly resultLimit?: number,
    private readonly filter?: {
      field: string;
      operator: "==";
      value: unknown;
    },
  ) {}

  where(field: string, operator: "==", value: unknown) {
    return new LocalQuery(
      this.collectionName,
      this.sortField,
      this.sortDirection,
      this.resultLimit,
      { field, operator, value },
    );
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new LocalQuery(
      this.collectionName,
      field,
      direction,
      this.resultLimit,
      this.filter,
    );
  }

  limit(count: number) {
    return new LocalQuery(
      this.collectionName,
      this.sortField,
      this.sortDirection,
      count,
      this.filter,
    );
  }

  async get(): Promise<LocalQuerySnapshot> {
    let entries = Object.entries(collectionRecords(this.collectionName));

    if (this.filter) {
      entries = entries.filter(([, value]) => {
        if (this.filter?.operator !== "==") return false;
        return value[this.filter.field] === this.filter.value;
      });
    }

    if (this.sortField) {
      entries.sort(([leftId, left], [rightId, right]) => {
        const leftValue = left[this.sortField!];
        const rightValue = right[this.sortField!];
        const leftKey = leftValue instanceof Date ? leftValue.getTime() : String(leftValue ?? "");
        const rightKey = rightValue instanceof Date ? rightValue.getTime() : String(rightValue ?? "");
        const result =
          typeof leftKey === "number" && typeof rightKey === "number"
            ? leftKey - rightKey
            : String(leftKey).localeCompare(String(rightKey));
        return (this.sortDirection === "desc" ? -1 : 1) * (result || leftId.localeCompare(rightId));
      });
    }

    if (this.resultLimit !== undefined) entries = entries.slice(0, this.resultLimit);

    const docs = entries.map(([id, value]) => snapshot(id, value));
    return { docs, empty: docs.length === 0, size: docs.length };
  }
}

class LocalDocumentReference {
  constructor(
    private readonly collectionName: string,
    readonly id: string,
  ) {}

  async get() {
    return snapshot(this.id, collectionRecords(this.collectionName)[this.id]);
  }

  async create(value: LocalRecord) {
    const records = collectionRecords(this.collectionName);
    if (records[this.id] !== undefined) {
      throw Object.assign(new Error("Document already exists"), {
        code: "already-exists",
      });
    }
    records[this.id] = clone(value);
    saveDatabase();
  }

  async set(value: LocalRecord, options?: SetOptions) {
    const records = collectionRecords(this.collectionName);
    records[this.id] = options?.merge
      ? { ...(records[this.id] ?? {}), ...clone(value) }
      : clone(value);
    saveDatabase();
  }

  async delete() {
    delete collectionRecords(this.collectionName)[this.id];
    saveDatabase();
  }
}

class LocalCollectionReference extends LocalQuery {
  constructor(collectionName: string) {
    super(collectionName);
  }

  doc(id = randomUUID().replaceAll("-", "")) {
    return new LocalDocumentReference(this.collectionName, id);
  }

  async add(value: LocalRecord) {
    const reference = this.doc();
    await reference.set(value);
    return reference;
  }
}

export const localFirestore = {
  collection(name: string) {
    return new LocalCollectionReference(name);
  },
};