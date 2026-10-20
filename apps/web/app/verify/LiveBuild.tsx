"use client";
/**
 * The build this site is serving right now, read from /build.json, with the exact commands to
 * check it filled in. The page itself is static; this part loads in the browser.
 */
import { useEffect, useState } from "react";
import styles from "../privacy/privacy.module.css";

interface BuildManifest {
  commit: string | null;
  fingerprint: string;
  settings: Record<string, string>;
  files: Record<string, string>;
}

export function LiveBuild({ repoUrl, walletOrigin }: { repoUrl: string; walletOrigin: string }) {
  const [build, setBuild] = useState<BuildManifest | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/build.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((b: BuildManifest) => setBuild(b))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p className="small muted">This copy of the site has no build manifest (a development build).</p>;
  if (!build) return <p className="small muted" aria-live="polite">Reading the live build…</p>;

  const commit = build.commit ?? "";
  const args = Object.entries(build.settings).map(([k, v]) => `  --build-arg ${k}=${v} \\`).join("\n");
  const rebuild = [
    `git clone ${repoUrl}.git monkstash && cd monkstash`,
    `git checkout ${commit || "<commit>"}`,
    `docker build --platform linux/amd64 --target build -f deploy/Dockerfile.web \\`,
    `  --build-arg BUILD_COMMIT=${commit || "<commit>"} \\`,
    args,
    `  -t monkstash-check .`,
    `docker run --rm monkstash-check cat apps/web/public/build.json > my-build.json`,
    `node scripts/verify-build.mjs ${walletOrigin} --compare my-build.json`,
  ].join("\n");

  return (
    <>
      <table className={styles.table}>
        <tbody>
          <tr><th scope="row">Source commit</th><td>{commit ? <a href={`${repoUrl}/commit/${commit}`} className="mono">{commit.slice(0, 12)}</a> : "not set"}</td></tr>
          <tr><th scope="row">Fingerprint</th><td className="mono" style={{ overflowWrap: "anywhere" }}>{build.fingerprint}</td></tr>
          <tr><th scope="row">Files covered</th><td>{Object.keys(build.files).length}</td></tr>
        </tbody>
      </table>
      <h3>Quick check (one minute)</h3>
      <p>Downloads every file the site lists and checks each one, plus the scripts the wallet page loads. Needs Node.js 18 or newer.</p>
      <pre className="mono" style={{ overflowX: "auto", fontSize: "0.85rem" }}><code>{`git clone ${repoUrl}.git monkstash && cd monkstash\nnode scripts/verify-build.mjs ${walletOrigin}`}</code></pre>
      <h3>Full check: rebuild it yourself</h3>
      <p>Builds this exact commit in Docker, then compares your files with the site&apos;s. A match means the site serves exactly the published source.</p>
      <pre className="mono" style={{ overflowX: "auto", fontSize: "0.85rem" }}><code>{rebuild}</code></pre>
    </>
  );
}
