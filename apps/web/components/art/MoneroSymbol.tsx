/**
 * The official Monero symbol. Geometry copied unchanged from the Monero Project's logo
 * (originals kept in /public/brand/monero). Only the colour treatment varies.
 *
 * Use it to stand for Monero itself: coins, XMR, "the network". Never use it as, or merge
 * it into, MonkStash's own mark (the monk + sprig in BrandMark.tsx): that would suggest an
 * official Monero product, which is exactly the confusion phishing clones exploit.
 *
 * Renders an <svg>, so it works both in HTML and nested inside another SVG illustration
 * (pass x/y in the parent's coordinate space).
 */

const VIEWBOX = "0 0 3756.09 3756.49";
const SHIFT = "translate(-371.96 -371.75)";
const DISC = "M4128,2249.81C4128,3287,3287.26,4127.86,2250,4127.86S372,3287,372,2249.81,1212.76,371.75,2250,371.75,4128,1212.54,4128,2249.81Z";
const UPPER = "M2250,371.75c-1036.89,0-1879.12,842.06-1877.8,1878,0.26,207.26,33.31,406.63,95.34,593.12h561.88V1263L2250,2483.57,3470.52,1263v1579.9h562c62.12-186.48,95-385.85,95.37-593.12C4129.66,1212.76,3287,372,2250,372Z";
const LOWER = "M1969.3,2764.17l-532.67-532.7v994.14H1029.38l-384.29.07c329.63,540.8,925.35,902.56,1604.91,902.56S3525.31,3766.4,3855,3225.6H3063.25V2231.47l-532.7,532.7-280.61,280.61-280.62-280.61h0Z";

export type MoneroSymbolVariant =
  /** Official colours: orange upper, grey lower, white disc. Use for the one hero coin in a figure. */
  | "color"
  /** Single colour from `currentColor` (set `color` via style or a parent). Fits line-art figures and dark bands. */
  | "mono";

export function MoneroSymbol({
  size = 24,
  variant = "color",
  x,
  y,
  title,
  className,
  style,
}: {
  size?: number;
  variant?: MoneroSymbolVariant;
  x?: number;
  y?: number;
  /** Accessible name. Omit when the symbol is decorative or the parent figure already describes it. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const color = variant === "color";
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox={VIEWBOX}
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g transform={SHIFT}>
        {color ? <path d={DISC} fill="#fff" /> : null}
        <path d={UPPER} fill={color ? "#f26822" : "currentColor"} />
        <path d={LOWER} fill={color ? "#4d4d4d" : "currentColor"} />
      </g>
    </svg>
  );
}
