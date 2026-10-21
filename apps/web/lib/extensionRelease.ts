/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.3",
  url: `${repoUrl}/releases/tag/extension-v0.1.3`,
  published: "2026-10-22",
  chrome: {
    version: "0.1.3",
    file: "monkstash-chrome-0.1.3.zip",
    sha256: "f0e1083b2053c4270d6774be4c8941ddd57d39d3cbabdfe4f5bf0eaf835a654d",
    fingerprint: "8a6546e37788c97821e919dca388a6d87e470119c0ed64d45c9f3af1f8f4d535",
  },
  firefox: {
    version: "0.1.3",
    file: "monkstash-firefox-0.1.3.zip",
    sha256: "b7422694482dd52345f9ada8f859d022fd00e96ab592f54138521cfc92344332",
    fingerprint: "1f7092e118205278abf5f930e57d102eb6e326453cc0c2201a3c097b1a12fbdf",
  },
} as const;
