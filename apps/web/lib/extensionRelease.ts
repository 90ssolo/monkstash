/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.6",
  url: `${repoUrl}/releases/tag/extension-v0.1.6`,
  published: "2026-10-24",
  chrome: {
    version: "0.1.6",
    file: "monkstash-chrome-0.1.6.zip",
    sha256: "ad7c66654aabaa868427323d774fc28ba901bd12d18774d5a01d42c61529bc9d",
    fingerprint: "e5a8ed5b02a9aa04f1b3cb38170fe6b4dd88bfa580c9ba7075722a107e2025d6",
  },
  firefox: {
    version: "0.1.6",
    file: "monkstash-firefox-0.1.6.zip",
    sha256: "a5589954495507e426eb0308532c2ac6d03548b47f63effd98301f866e00e789",
    fingerprint: "965bf43c21f122ce2bbbc35515d855d5498012443e1cbe51c3c19d61dc33d683",
  },
} as const;
