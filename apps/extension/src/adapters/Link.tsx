/** Stands in for next/link in the extension: a plain link (main.tsx opens website links in a tab). */
import type { AnchorHTMLAttributes, ReactNode } from "react";

export default function Link({ href, children, prefetch: _prefetch, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode; prefetch?: boolean }) {
  return <a href={href} {...rest}>{children}</a>;
}
