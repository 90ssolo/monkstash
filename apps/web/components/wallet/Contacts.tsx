"use client";
/**
 * Private contacts on the Send screen: quick-pick chips, a small manager (add, edit, remove),
 * and the tamper alarm shown under the recipient field. Contacts are stored encrypted on this
 * device only (see lib/wallet/contacts.ts).
 */
import { useState } from "react";
import { checkContact, ContactError, formatXmr, shortAddress, sortContacts, type Contact, type NetworkType } from "@quietmint/wallet-core";
import { CopyButton } from "./CopyButton";
import styles from "./wallet.module.css";

export function ContactChips({ contacts, onPick, onManage }: { contacts: Contact[]; onPick: (c: Contact) => void; onManage: () => void }) {
  const list = sortContacts(contacts).slice(0, 12);
  return (
    <div className={styles.contactBar}>
      <div className={styles.contactBarHead}>
        <span className={styles.contactLabel}>Pay a contact</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onManage}>{contacts.length ? "Manage contacts" : "Add a contact"}</button>
      </div>
      {list.length ? (
        <ul className={styles.chips} aria-label="Your contacts">
          {list.map((c) => (
            <li key={c.id}>
              <button type="button" className={styles.contactChip} onClick={() => onPick(c)} title={c.alias ?? shortAddress(c.address, 6)}>
                <span className={styles.avatar} aria-hidden="true">{c.name.slice(0, 1).toUpperCase()}</span>
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="small muted" style={{ margin: 0 }}>Save people you pay often. Contacts are encrypted on this device, and they warn you if an address looks tampered with.</p>
      )}
    </div>
  );
}

/** A contact's own receive address, with what arrived at it. */
export interface PayAddress { address: string; received: bigint }

export function ContactManager({ contacts, network, onSave, onClose, payAddress, onGiveAddress, hidden = false }: {
  contacts: Contact[];
  network: NetworkType;
  onSave: (list: Contact[]) => Promise<void>;
  onClose: () => void;
  /** The address this contact was given to pay you, if any. */
  payAddress?: (c: Contact) => PayAddress | null;
  /** Makes a fresh address just for this contact (full wallets only). */
  onGiveAddress?: (c: Contact) => Promise<void>;
  hidden?: boolean;
}) {
  const [giving, setGiving] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const startEdit = (c: Contact | null) => {
    setEditing(c);
    setName(c?.name ?? "");
    setAddress(c?.address ?? "");
    setNote(c?.note ?? "");
    setError(null);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const clean = checkContact({ name, address, note, alias: editing?.alias }, network, contacts, editing?.id);
      // Editing a contact's address removes its OpenAlias link: the name no longer vouches for it.
      const alias = editing && editing.address === clean.address ? editing.alias : undefined;
      const record = (base: Pick<Contact, "id" | "createdAt" | "lastPaidAt" | "receiveIndex">): Contact => ({
        id: base.id, name: clean.name, address: clean.address, createdAt: base.createdAt,
        ...(base.lastPaidAt ? { lastPaidAt: base.lastPaidAt } : {}),
        ...(base.receiveIndex !== undefined ? { receiveIndex: base.receiveIndex } : {}),
        ...(clean.note ? { note: clean.note } : {}),
        ...(alias ? { alias } : {}),
      });
      const next = editing
        ? contacts.map((c) => (c.id === editing.id ? record(c) : c))
        : [...contacts, record({ id: crypto.randomUUID(), createdAt: new Date().toISOString() })];
      setBusy(true);
      await onSave(next);
      startEdit(null);
    } catch (err) {
      setError(err instanceof ContactError || err instanceof Error ? err.message : "The contact could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Contact) {
    try {
      await onSave(contacts.filter((x) => x.id !== c.id));
      if (editing?.id === c.id) startEdit(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className={styles.contactManager} aria-labelledby="contacts-list-h">
      <div className={styles.contactBarHead}>
        <h3 id="contacts-list-h" style={{ margin: 0 }}>Contacts</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Done</button>
      </div>
      {contacts.length && onGiveAddress ? (
        <p className="small muted" style={{ margin: 0 }}>
          Give each person their own address to pay you. Their payments then show who they came from, and if an address ever
          turns up somewhere else, you know who shared it.
        </p>
      ) : null}
      {contacts.length ? (
        <ul className={styles.contactList}>
          {sortContacts(contacts).map((c) => {
            const mine = payAddress?.(c) ?? null;
            return (
              <li key={c.id}>
                <div style={{ minWidth: 0 }}>
                  <strong>{c.name}</strong>
                  <span className="small muted mono">{c.alias ? `${c.alias} (${shortAddress(c.address, 5)})` : shortAddress(c.address, 6)}</span>
                </div>
                <span className={styles.contactActions}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}>Edit</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => void remove(c)}>Remove</button>
                </span>
                {mine ? (
                  <div className={styles.payAddr}>
                    <span className="small">Their address for paying you: <span className="mono">{shortAddress(mine.address, 6)}</span></span>
                    <span className="small muted">{hidden ? "Received: hidden" : mine.received > 0n ? `Received ${formatXmr(mine.received, 6)} XMR from it` : "Nothing received at it yet"}</span>
                    <CopyButton value={mine.address} label={`Copy ${c.name}'s address`} />
                  </div>
                ) : onGiveAddress ? (
                  <div className={styles.payAddr}>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={giving !== null} onClick={async () => {
                      setGiving(c.id);
                      setError(null);
                      try { await onGiveAddress(c); } catch (err) { setError((err as Error).message || "A new address could not be made."); } finally { setGiving(null); }
                    }}>{giving === c.id ? "Creating…" : `Give ${c.name} their own address`}</button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      <form onSubmit={save} className={styles.contactForm}>
        <h4 style={{ margin: 0 }}>{editing ? `Edit ${editing.name}` : "Add a contact"}</h4>
        <div className="field">
          <label htmlFor="c-name">Name</label>
          <input id="c-name" className="input" maxLength={40} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="c-addr">Monero address</label>
          <textarea id="c-addr" className="textarea mono" style={{ minHeight: 72 }} spellCheck={false} autoComplete="off" autoCapitalize="none" value={address} onChange={(e) => setAddress(e.target.value)} />
          <span className="hint">Copy it from a message you trust, and check it with them once. After that, MonkStash checks for you.</span>
        </div>
        <div className="field">
          <label htmlFor="c-note">Note (optional)</label>
          <input id="c-note" className="input" maxLength={120} autoComplete="off" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
        <div className={styles.contactActions}>
          <button className="btn btn-primary btn-sm" disabled={busy}>{editing ? "Save changes" : "Save contact"}</button>
          {editing ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(null)}>Cancel</button> : null}
        </div>
      </form>
    </section>
  );
}

/** The loud warning under the recipient field, with the explicit confirmation it requires. */
export function TamperAlarm({ title, children, checked, onCheck }: { title: string; children: React.ReactNode; checked: boolean; onCheck: (v: boolean) => void }) {
  return (
    <div className={styles.alarm} role="alert">
      <strong className={styles.alarmTitle}>{title}</strong>
      <div className={styles.alarmBody}>{children}</div>
      <label className={styles.trust}>
        <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} />
        <span>I checked the whole address with them directly, not from the same message or clipboard.</span>
      </label>
    </div>
  );
}
