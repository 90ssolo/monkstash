import QRCode from "qrcode";

/**
 * A QR code drawn on the server as inline SVG, for values fixed at build time (the donation
 * address). Same look as the wallet's Qr component, without sending the QR library to the
 * browser or drawing it there.
 */
export async function StaticQr({ value, label, size = 196 }: { value: string; label: string; size?: number }) {
  const svg = await QRCode.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#121a17", light: "#ffffff" } });
  return (
    <div style={{ boxSizing: "border-box", width: size, height: size, background: "#fff", borderRadius: 10, padding: 8, border: "1px solid var(--line)" }}>
      <div role="img" aria-label={label} style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", '<svg width="100%" height="100%" aria-hidden="true" focusable="false" ') }} />
    </div>
  );
}
