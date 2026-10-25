/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.14",
  url: `${repoUrl}/releases/tag/extension-v0.1.14`,
  published: "2026-10-26",
  chrome: {
    version: "0.1.14",
    file: "monkstash-chrome-0.1.14.zip",
    sha256: "602cdbbb8af1c1f78e18bc2e92ed90b46b06b730fec5530ed7311a7e9daf4714",
    fingerprint: "d1e7239e4ab84f1db9644a091970c3046c78b30f2468b8e8c399926d0a222026",
  },
  firefox: {
    version: "0.1.14",
    file: "monkstash-firefox-0.1.14.zip",
    sha256: "e3936764460422b84dd071045df4d9a87c537daeadda931a21c435242139cd41",
    fingerprint: "6b6209edab4d308d4104aa125dd974ed5e49968e26beeca1083b99d60dde3980",
  },
} as const;
