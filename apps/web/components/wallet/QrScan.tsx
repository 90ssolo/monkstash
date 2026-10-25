"use client";
/**
 * Scans a QR code with the device camera, or reads one from a screenshot or photo, entirely on the
 * device: frames and pictures never leave the page. Uses the browser's own BarcodeDetector where it
 * exists (Chrome, Edge, Android) and the jsQR decoder elsewhere (Firefox, Safari), loaded only
 * when a scan starts.
 */
import { useEffect, useRef, useState } from "react";
import styles from "./wallet.module.css";

type Detect = (frame: HTMLVideoElement, canvas: HTMLCanvasElement) => Promise<string | null>;

interface BarcodeDetectorLike { detect(source: CanvasImageSource): Promise<{ rawValue: string }[]> }
declare global {
  interface Window { BarcodeDetector?: { new (o: { formats: string[] }): BarcodeDetectorLike; getSupportedFormats?(): Promise<string[]> } }
}

async function makeDetector(): Promise<Detect> {
  const Native = window.BarcodeDetector;
  const formats: string[] = (await Native?.getSupportedFormats?.().catch(() => [] as string[])) ?? [];
  if (Native && formats.includes("qr_code")) {
    const d = new Native({ formats: ["qr_code"] });
    return async (video) => (await d.detect(video).catch(() => []))[0]?.rawValue ?? null;
  }
  const { default: jsQR } = await import("jsqr");
  return async (video, canvas) => {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    // Decoding a smaller copy is much faster and still reads phone-screen and printed codes.
    const scale = Math.min(1, 640 / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" })?.data ?? null;
  };
}

/** Reads a QR code from a picture file (a screenshot or photo), or null when it holds none. */
async function decodeImageFile(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const Native = window.BarcodeDetector;
  const formats: string[] = (await Native?.getSupportedFormats?.().catch(() => [] as string[])) ?? [];
  if (Native && formats.includes("qr_code")) {
    const hit = (await new Native({ formats: ["qr_code"] }).detect(canvas).catch(() => []))[0]?.rawValue;
    if (hit) return hit;
  }
  const { default: jsQR } = await import("jsqr");
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

function cameraError(e: unknown): string {
  const name = (e as DOMException)?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "The camera is blocked. Allow it for this site in your browser's settings, or paste the address instead.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera was found on this device. Paste the address instead.";
  if (name === "NotReadableError") return "The camera is busy in another app. Close it and try again.";
  return "The camera could not start. Paste the address instead.";
}

/** `pictures` false where a file dialog would close the view (the extension popup and side panel). */
export function QrScanButton({ onScan, disabled, pictures = true }: { onScan: (text: string) => void; disabled?: boolean; pictures?: boolean }) {
  const [open, setOpen] = useState(false);
  // Without a camera API (some embedded views) the dialog still reads a screenshot or photo.
  const [camera, setCamera] = useState(true);
  useEffect(() => { setCamera(!!navigator.mediaDevices?.getUserMedia); }, []);
  if (!camera && !pictures) return null;
  return (
    <>
      <button type="button" className={`btn btn-ghost btn-sm ${styles.scanBtn}`} disabled={disabled} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false"><path d="M1.75 5V3.25c0-.83.67-1.5 1.5-1.5H5M11 1.75h1.75c.83 0 1.5.67 1.5 1.5V5M14.25 11v1.75c0 .83-.67 1.5-1.5 1.5H11M5 14.25H3.25c-.83 0-1.5-.67-1.5-1.5V11M4.5 8h7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        Scan QR
      </button>
      {open ? <QrScanDialog camera={camera} pictures={pictures} onClose={() => setOpen(false)} onScan={(t) => { setOpen(false); onScan(t); }} /> : null}
    </>
  );
}

function QrScanDialog({ camera, pictures, onClose, onScan }: { camera: boolean; pictures: boolean; onClose: () => void; onScan: (text: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // The latest callback, without restarting the camera when the parent re-renders.
  const found = useRef(onScan);
  found.current = onScan;

  const [pictureMsg, setPictureMsg] = useState<string | null>(null);
  async function readPicture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPictureMsg("Reading the picture…");
    try {
      const text = await decodeImageFile(file);
      if (text) return found.current(text.trim());
      setPictureMsg("No QR code was found in that picture. Try a sharper screenshot, or crop it to the code.");
    } catch {
      setPictureMsg("That file could not be opened as a picture.");
    }
  }

  useEffect(() => {
    dialog.current?.showModal();
    if (!camera) return;
    let stream: MediaStream | null = null;
    let stop = false;
    let timer = 0;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (stop) return;
        const v = video.current!;
        v.srcObject = stream;
        await v.play();
        setReady(true);
        const detect = await makeDetector();
        const tick = async () => {
          if (stop) return;
          const text = await detect(v, canvas.current!).catch(() => null);
          if (stop) return;
          if (text) { found.current(text.trim()); return; }
          timer = window.setTimeout(() => void tick(), 180);
        };
        void tick();
      } catch (e) {
        if (!stop) setError(cameraError(e));
      }
    })();
    return () => {
      stop = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [camera]);

  return (
    <dialog ref={dialog} className={styles.scanDialog} aria-labelledby="scan-title" onClose={onClose} onCancel={onClose}>
      <div className={styles.scanHead}>
        <h3 id="scan-title">Scan a QR code</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      {camera ? (
        <div className={styles.scanView}>
          <video ref={video} muted playsInline aria-hidden="true" />
          {ready ? <span className={styles.scanFrame} aria-hidden="true" /> : null}
          {!ready && !error ? <p className={styles.scanMsg}>Starting the camera…</p> : null}
          {error ? <p className={styles.scanMsg} role="alert">{error}</p> : null}
        </div>
      ) : null}
      <canvas ref={canvas} style={{ display: "none" }} />
      {pictures ? (
        <div className={styles.scanPicture}>
          <label className="btn btn-secondary btn-sm">
            <input type="file" accept="image/*" className="visually-hidden" onChange={(e) => void readPicture(e)} />
            Choose a screenshot or photo
          </label>
          {pictureMsg ? <p className="small" role="status" style={{ margin: 0 }}>{pictureMsg}</p> : null}
        </div>
      ) : null}
      <p className="small muted" style={{ margin: 0 }}>{!pictures ? "Point the camera at an address or payment QR code. " : camera ? "Point the camera at an address or payment QR code, or pick a picture of one. " : "Pick a screenshot or photo of an address or payment QR code. "}It stays on this device.</p>
    </dialog>
  );
}
