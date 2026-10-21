/** Auto-lock: an unlocked wallet locks itself after this long with no interaction... */
export const AUTO_LOCK_IDLE_MS = 10 * 60 * 1000;
/** ...or after the tab has been hidden (switched away, minimised) for this long. */
export const AUTO_LOCK_HIDDEN_MS = 5 * 60 * 1000;
/** A running scan keeps a visible, untouched wallet open for at most this long (lock on leave on). */
export const AUTO_LOCK_SCAN_MAX_MS = 60 * 60 * 1000;

// Per-device choice: lock AUTO_LOCK_HIDDEN_MS after the tab is left (default), or let a running
// scan keep the wallet open in a background tab. Not a secret, so it lives outside the vault.
const LOCK_ON_LEAVE_KEY = "monkstash.lockOnLeave.v1";

export function readLockOnLeave(): boolean {
  try {
    return window.localStorage.getItem(LOCK_ON_LEAVE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function writeLockOnLeave(on: boolean): void {
  try {
    if (on) window.localStorage.removeItem(LOCK_ON_LEAVE_KEY);
    else window.localStorage.setItem(LOCK_ON_LEAVE_KEY, "off");
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
}
