"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Phone layout for data tables. Copies each column header onto its cells as data-label and
 * adds the "stack" class; globals.css then shows every row as a labelled card below 640px.
 * ARIA roles keep table semantics after the CSS switches the elements to display: block.
 * Without JavaScript the table stays a table and scrolls sideways.
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
  return null;
}
