/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.13",
  url: `${repoUrl}/releases/tag/extension-v0.1.13`,
  published: "2026-10-25",
  chrome: {
    version: "0.1.13",
    file: "monkstash-chrome-0.1.13.zip",
    sha256: "a220283c391a1f461995efb1492aa3eb5a5a4f2900f21e8de0c0eeeb4e468c33",
    fingerprint: "2bb72777e0358e344b427cbfdeb719a9c3ad632c26300f53c1e7bd9e2434ac00",
  },
  firefox: {
    version: "0.1.13",
    file: "monkstash-firefox-0.1.13.zip",
    sha256: "7717e3d131161ff11fcc89646698e035ee5f777e533fa22dd6691c02c3e9b421",
    fingerprint: "82fa1fdc34bfc3b6d201da5d8befebb3e4787aa37654c31c91328593079700d2",
  },
} as const;
