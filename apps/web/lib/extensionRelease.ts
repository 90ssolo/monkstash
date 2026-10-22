/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.5",
  url: `${repoUrl}/releases/tag/extension-v0.1.5`,
  published: "2026-10-22",
  chrome: {
    version: "0.1.5",
    file: "monkstash-chrome-0.1.5.zip",
    sha256: "16a926344198e0327d2445166d5dc3fe4d614832647b0cc8f9a626c833d7e79d",
    fingerprint: "c023e64fa676ebbf84e00487572ba3c368fb677b64919fe8be0d2692067a8254",
  },
  firefox: {
    version: "0.1.5",
    file: "monkstash-firefox-0.1.5.zip",
    sha256: "d179f572dfebc6258c35bcf79ab080d35d5094f4f86e401b9e31c82b50727437",
    fingerprint: "c02e9f52fab3099fa73761dba8ae726091cc715a64edaabc4570e9b15df5d3e8",
  },
} as const;
