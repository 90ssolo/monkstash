"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function Qr({ value, label, size = 196 }: { value: string; label: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, { margin: 1, width: size * 2, errorCorrectionLevel: "M", color: { dark: "#121a17", light: "#ffffff" } })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null));
    return () => { alive = false; };
  }, [value, size]);
  return (
    <div style={{ width: size, height: size, background: "#fff", borderRadius: 10, padding: 8, border: "1px solid var(--line)" }}>
      {src ? <img src={src} width={size - 16} height={size - 16} alt={label} /> : null}
    </div>
  );
}
