/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.7",
  url: `${repoUrl}/releases/tag/extension-v0.1.7`,
  published: "2026-10-24",
  chrome: {
    version: "0.1.7",
    file: "monkstash-chrome-0.1.7.zip",
    sha256: "a542bf77451045a52337d35fd2ca27a0d0be12e28e4a7e4c1481734fba6ff67e",
    fingerprint: "c9c97526fa64f0fd6c1eb7aa899ba4cf46464ea5586f500d1d8904ec879d3700",
  },
  firefox: {
    version: "0.1.7",
    file: "monkstash-firefox-0.1.7.zip",
    sha256: "5c97c85269bd3eb502afe4e7ccdaca4902bf217ba40041dbaab266ae815909f7",
    fingerprint: "05f98d16a38f8501912329155b2e81342beb1e78fc69c4f08c045ad3b2f11bed",
  },
} as const;
