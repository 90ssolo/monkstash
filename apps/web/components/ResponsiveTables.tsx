"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Phone layout for data tables. Copies each column header onto its cells as data-label and
 * adds the "stack" class; globals.css then shows every row as a labelled card below 640px.
 * ARIA roles keep table semantics after the CSS switches the elements to display: block.
 * Without JavaScript the table stays a table and scrolls sideways. Also gives sideways-scrolling
 * diagram frames a keyboard tab stop (below).
 */
export function ResponsiveTables() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelectorAll<HTMLTableElement>("main table").forEach((table) => {
      if (table.classList.contains("stack")) return;
      const head = table.tHead?.rows[0];
      if (!head) return;
      const labels = Array.from(head.cells).map((c) => (c.textContent ?? "").replace(/ /g, " ").trim());
      table.setAttribute("role", "table");
      table.querySelectorAll("tr").forEach((tr) => tr.setAttribute("role", "row"));
      head.querySelectorAll("th").forEach((th) => th.setAttribute("role", "columnheader"));
      Array.from(table.tBodies).forEach((body) => {
        Array.from(body.rows).forEach((row) => {
          Array.from(row.cells).forEach((cell, i) => {
            cell.setAttribute("role", i === 0 ? "rowheader" : "cell");
            if (i === 0) cell.classList.add("stack-title");
            else if (labels[i]) cell.setAttribute("data-label", labels[i]!);
          });
        });
      });
      table.classList.add("stack");
    });
  }, [pathname]);

  // Wide diagrams scroll sideways inside their frame on phones (globals.css). A frame that
  // scrolls must be reachable by keyboard, so it gets a tab stop and a name while it scrolls.
  useEffect(() => {
    const mark = () => {
      document.querySelectorAll<HTMLElement>("main :has(> svg)").forEach((frame) => {
        const scrolls = getComputedStyle(frame).overflowX === "auto" && frame.scrollWidth > frame.clientWidth + 1;
        if (scrolls && !frame.hasAttribute("data-scroll-frame")) {
          const name = frame.querySelector(":scope > svg")?.getAttribute("aria-label");
          frame.setAttribute("data-scroll-frame", "");
          frame.tabIndex = 0;
          frame.setAttribute("role", "region");
          frame.setAttribute("aria-label", name ? `Diagram, scrolls sideways: ${name}` : "Diagram, scrolls sideways");
        } else if (!scrolls && frame.hasAttribute("data-scroll-frame")) {
          frame.removeAttribute("data-scroll-frame");
          frame.removeAttribute("tabindex");
          frame.removeAttribute("role");
          frame.removeAttribute("aria-label");
        }
      });
    };
    mark();
    window.addEventListener("resize", mark);
    return () => window.removeEventListener("resize", mark);
  }, [pathname]);
  return null;
}
