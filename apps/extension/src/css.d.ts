/** CSS imports, as the bundler handles them (Next.js declares the same for the website). */
declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
declare module "*.css";
