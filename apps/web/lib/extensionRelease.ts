/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.2",
  url: `${repoUrl}/releases/tag/extension-v0.1.2`,
  published: "2026-10-21",
  chrome: {
    version: "0.1.2",
    file: "monkstash-chrome-0.1.2.zip",
    sha256: "3e6e3b95b98d85069e039bbce24b2510c36317c0dd6c410ace390e2a896eb425",
    fingerprint: "5ba6358991128fa3a01c0e6b6bb8984170eb7c0a7dc7e445a3c982fe43e6c7aa",
  },
  firefox: {
    version: "0.1.2",
    file: "monkstash-firefox-0.1.2.zip",
    sha256: "2b2ac8ff29a87e2b87e6f263c56979eca135c0f3d961ccea9647a4e652c14e2f",
    fingerprint: "58e2fea42123811ccb67d12362eb0de9f67e8900fa818842e5148a2315d61285",
  },
} as const;
