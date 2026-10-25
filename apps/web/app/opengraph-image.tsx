import { brandedOgImage, ogContentType, ogSize } from "@/components/og/BrandedOgImage";

export const alt = "MonkStash: a private, non-custodial Monero web wallet";
export const size = ogSize;
export const contentType = ogContentType;

// Branded default social image. Articles have their own (app/[slug]/opengraph-image.tsx).
export default function OgImage() {
  return brandedOgImage({
    headline: "Spend like it's nobody's business.",
    sub: "A free, non-custodial Monero wallet. Your keys stay on your device.",
  });
}
