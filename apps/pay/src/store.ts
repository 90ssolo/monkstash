/**
 * Invoices and the webhook outbox, kept in one JSON file on the merchant's own server.
 * Writes are serialized and atomic (temp file flushed to disk, then rename), so a crash never
 * leaves a half-written file. The previous good file is kept as invoices.json.bak and loaded
 * if the main file is ever damaged. Fine for a shop's volume; the file is small and loaded
 * into memory.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { InvoiceJson } from "@quietmint/wallet-core";

export type InvoiceEvent = "invoice.paid" | "invoice.partial" | "invoice.late" | "invoice.expired" | "invoice.confirming" | "invoice.reverted";

export interface StoredInvoice {
  invoice: InvoiceJson;
  /** Wallet account the subaddress is in. Absent on invoices made before PAY_ACCOUNT existed: 0. */
  account?: number;
  /** First-seen time per tx hash (ms), to tell late payments apart. */
  seen: Record<string, number>;
  returnUrl?: string;
  /** The shop's own opaque data (order id and so on), echoed back in webhooks. */
  metadata?: string;
  /** Last status a webhook was queued for, so each change is sent once. */
  notified?: string;
}

export interface OutboxItem {
  id: string;
  invoiceId: string;
  event: InvoiceEvent;
  body: string;
  attempts: number;
  nextAt: number;
  lastError?: string;
}

export interface StoreData {
  version: 1;
  invoices: Record<string, StoredInvoice>;
  outbox: OutboxItem[];
  /** Time (ms) of the last successful wallet sync. Absent in files from older versions. */
  lastSyncAt?: number;
}

/** Reads one store file: null when it does not exist; throws when it cannot be read or parsed. */
async function readStoreFile(file: string): Promise<StoreData | null> {
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
  const raw = JSON.parse(text) as StoreData;
  return raw?.version === 1 && raw.invoices && Array.isArray(raw.outbox) ? raw : null;
}

/** Flushes a directory entry (the rename) to disk. Not supported on Windows, where it is skipped. */
async function syncDir(dir: string): Promise<void> {
  try {
    const d = await fs.open(dir, "r");
    try { await d.sync(); } finally { await d.close(); }
  } catch {
    // Directory fsync is not available on every platform.
  }
}

export class Store {
  private data: StoreData = { version: 1, invoices: {}, outbox: [] };
  private writing: Promise<void> = Promise.resolve();
  private readonly file: string;
  private readonly bak: string;
  /** The main file was damaged at load: the next save must not copy it over the good backup. */
  private mainDamaged = false;
  /** lastSyncAt as last written to disk. */
  private savedSyncAt: number | undefined;

  constructor(dir: string) {
    this.file = path.join(dir, "invoices.json");
    this.bak = `${this.file}.bak`;
  }

  async load(): Promise<void> {
    await fs.mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
    let data: StoreData | null;
    try {
      data = await readStoreFile(this.file);
    } catch (err) {
      if (!(err instanceof SyntaxError)) throw new Error(`Could not read ${this.file}: ${(err as Error).message}`);
      // Damaged (a disk problem, say): fall back to the previous good copy.
      let bak: StoreData | null = null;
      try { bak = await readStoreFile(this.bak); } catch { bak = null; }
      if (!bak) throw new Error(`Could not read ${this.file} (${err.message}), and no usable backup ${this.bak} exists.`);
      console.warn(`[pay] warning: ${this.file} is damaged (${err.message}); loaded the backup ${this.bak} instead. Changes since that backup was written may be missing.`);
      data = bak;
      this.mainDamaged = true;
    }
    if (data) this.data = data;
    this.savedSyncAt = this.data.lastSyncAt;
  }

  /** Time (ms) of the last successful wallet sync, kept across restarts. */
  get lastSyncAt(): number | undefined {
    return this.data.lastSyncAt;
  }

  /**
   * Records a successful sync. Returns true when the time on disk is more than a minute behind,
   * so callers save now and then instead of on every sync.
   */
  markSynced(at: number): boolean {
    this.data.lastSyncAt = at;
    return this.savedSyncAt === undefined || at - this.savedSyncAt > 60_000;
  }

  get(id: string): StoredInvoice | undefined {
    return Object.prototype.hasOwnProperty.call(this.data.invoices, id) ? this.data.invoices[id] : undefined;
  }

  all(): StoredInvoice[] {
    return Object.values(this.data.invoices);
  }

  get outbox(): OutboxItem[] {
    return this.data.outbox;
  }

  async put(rec: StoredInvoice): Promise<void> {
    this.data.invoices[rec.invoice.id] = rec;
    await this.save();
  }

  async update(fn: (d: StoreData) => void): Promise<void> {
    fn(this.data);
    await this.save();
  }

  /** Serialized atomic write. */
  save(): Promise<void> {
    const snapshot = JSON.stringify(this.data);
    const syncAt = this.data.lastSyncAt;
    // A failed earlier write must not block later ones.
    this.writing = this.writing.catch(() => {}).then(async () => {
      const tmp = `${this.file}.${process.pid}.tmp`;
      const fh = await fs.open(tmp, "w", 0o600);
      try {
        await fh.writeFile(snapshot, "utf8");
        await fh.sync();
      } finally {
        await fh.close();
      }
      // Keep the current (good) file as the backup: copy it aside, then swap the copy in with a
      // rename, so the backup itself is never half-written.
      if (!this.mainDamaged) {
        const bakTmp = `${this.bak}.${process.pid}.tmp`;
        try {
          await fs.copyFile(this.file, bakTmp);
          await fs.rename(bakTmp, this.bak);
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
        }
      }
      await fs.rename(tmp, this.file);
      await syncDir(path.dirname(this.file));
      this.mainDamaged = false;
      this.savedSyncAt = syncAt;
    });
    return this.writing;
  }
}
