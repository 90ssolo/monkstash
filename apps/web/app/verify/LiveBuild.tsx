"use client";
/**
 * The build this site is serving right now, read from /build.json, with the exact commands to
 * check it filled in. The page itself is static; this part loads in the browser.
 */
import { useEffect, useState } from "react";
import { CodeSnippet } from "@/components/CodeSnippet";
import { CopyButton } from "@/components/wallet/CopyButton";
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
    `# 1. The source, at the commit this site runs`,
    `git clone ${repoUrl}.git monkstash && cd monkstash`,
    `git checkout ${commit || "<commit>"}`,
    `# 2. Build it with the same pinned tools and public settings`,
    `docker build --target build -f deploy/Dockerfile.web \\`,
    `  --build-arg BUILD_COMMIT=${commit || "<commit>"} \\`,
    args,
    `  -t monkstash-check .`,
    `# 3. Compare your files with the ones this site serves`,
    `docker run --rm monkstash-check cat apps/web/public/build.json > my-build.json`,
    `node scripts/verify-build.mjs ${walletOrigin} --compare my-build.json`,
  ].join("\n");

  return (
    <>
      <table className={styles.table}>
        <tbody>
          <tr><th scope="row">Source commit</th><td>{commit ? <a href={`${repoUrl}/commit/${commit}`} className="mono">{commit.slice(0, 12)}</a> : "not set"}</td></tr>
          <tr><th scope="row">Fingerprint</th><td><span className="mono" style={{ overflowWrap: "anywhere", display: "block", marginBottom: 8 }}>{build.fingerprint}</span><CopyButton value={build.fingerprint} label="Copy fingerprint" /></td></tr>
          <tr><th scope="row">Files covered</th><td>{Object.keys(build.files).length}</td></tr>
        </tbody>
      </table>
      <h3>Quick check (one minute)</h3>
      <p>Downloads every file the site lists and checks each one, plus the scripts the wallet page loads.</p>
      <CodeSnippet title="Quick check" note="Node.js 18 or newer" code={`git clone ${repoUrl}.git monkstash && cd monkstash\nnode scripts/verify-build.mjs ${walletOrigin}`} />
      <h3>Full check: rebuild it yourself</h3>
      <p>Builds this exact commit in Docker, then compares your files with the site&apos;s. A match means the site serves exactly the published source.</p>
      <CodeSnippet title="Full check" note="Docker, on x86-64 or ARM64" code={rebuild} />
    </>
  );
}
