/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.10",
  url: `${repoUrl}/releases/tag/extension-v0.1.10`,
  published: "2026-10-24",
  chrome: {
    version: "0.1.10",
    file: "monkstash-chrome-0.1.10.zip",
    sha256: "1885bc2adcd00e518673dd7f89de0f7051ffd68641d0e5bf89c3129e406c33e6",
    fingerprint: "8fcf3b4fd9663dfb6266defeb3f3bc0912c864a07de05f428fe98022271055f4",
  },
  firefox: {
    version: "0.1.10",
    file: "monkstash-firefox-0.1.10.zip",
    sha256: "0d75b9eb42558f03f5a8f3a588b82c3259f729ede11728aca94af81e5c490871",
    fingerprint: "17349259b073afdc2bff0f75349894c69db01ac7e19052a43b5281d2cb6b33c1",
  },
} as const;
