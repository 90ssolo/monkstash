/** Renders schema.org JSON-LD. Only describe content that is visible on the page. */
export function JsonLd({ data }: { data: object | object[] }) {
  // "\\u003c" is the six characters \u003c (JSON for "<"), so no "</script>" can end the tag early.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
