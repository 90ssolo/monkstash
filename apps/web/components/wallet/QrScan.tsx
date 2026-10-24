"use client";
/**
 * Scans a QR code with the device camera, entirely on the device: frames never leave the page.
 * Uses the browser's own BarcodeDetector where it exists (Chrome, Edge, Android) and the jsQR
 * decoder elsewhere (Firefox, Safari), loaded only when a scan starts.
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

function cameraError(e: unknown): string {
  const name = (e as DOMException)?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "The camera is blocked. Allow it for this site in your browser's settings, or paste the address instead.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera was found on this device. Paste the address instead.";
  if (name === "NotReadableError") return "The camera is busy in another app. Close it and try again.";
  return "The camera could not start. Paste the address instead.";
}

export function QrScanButton({ onScan, disabled }: { onScan: (text: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  // Hidden where the browser has no camera API at all (very old browsers, some embedded views).
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(!!navigator.mediaDevices?.getUserMedia); }, []);
  if (!supported) return null;
  return (
    <>
      <button type="button" className={`btn btn-ghost btn-sm ${styles.scanBtn}`} disabled={disabled} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false"><path d="M1.75 5V3.25c0-.83.67-1.5 1.5-1.5H5M11 1.75h1.75c.83 0 1.5.67 1.5 1.5V5M14.25 11v1.75c0 .83-.67 1.5-1.5 1.5H11M5 14.25H3.25c-.83 0-1.5-.67-1.5-1.5V11M4.5 8h7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        Scan QR
      </button>
      {open ? <QrScanDialog onClose={() => setOpen(false)} onScan={(t) => { setOpen(false); onScan(t); }} /> : null}
    </>
  );
}

function QrScanDialog({ onClose, onScan }: { onClose: () => void; onScan: (text: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // The latest callback, without restarting the camera when the parent re-renders.
  const found = useRef(onScan);
  found.current = onScan;

  useEffect(() => {
    dialog.current?.showModal();
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
  }, []);

  return (
    <dialog ref={dialog} className={styles.scanDialog} aria-labelledby="scan-title" onClose={onClose} onCancel={onClose}>
      <div className={styles.scanHead}>
        <h3 id="scan-title">Scan a QR code</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      <div className={styles.scanView}>
        <video ref={video} muted playsInline aria-hidden="true" />
        {ready ? <span className={styles.scanFrame} aria-hidden="true" /> : null}
        {!ready && !error ? <p className={styles.scanMsg}>Starting the camera…</p> : null}
        {error ? <p className={styles.scanMsg} role="alert">{error}</p> : null}
      </div>
      <canvas ref={canvas} style={{ display: "none" }} />
      <p className="small muted" style={{ margin: 0 }}>Point the camera at an address or payment QR code. The picture stays on this device.</p>
    </dialog>
  );
}
