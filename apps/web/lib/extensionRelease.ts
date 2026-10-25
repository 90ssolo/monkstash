/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.11",
  url: `${repoUrl}/releases/tag/extension-v0.1.11`,
  published: "2026-10-25",
  chrome: {
    version: "0.1.11",
    file: "monkstash-chrome-0.1.11.zip",
    sha256: "f6d5ede978f4a718c7d72a37cf66073fc9fa5eae307ad11a17b6b00f7a1fb5ea",
    fingerprint: "a28176748fb3145c12ef3e8c47b853aecfae4cabcd8a8dec0f347dbc9e4e5b4a",
  },
  firefox: {
    version: "0.1.11",
    file: "monkstash-firefox-0.1.11.zip",
    sha256: "d12dd111d6463a56a6a72e0ec296a703c5f5f77ef0ce95b3fe6fe43cac09ed66",
    fingerprint: "30643849fb196f9dc420822cb7163d6b035524ba5c890dc536695cc872cb67e1",
  },
} as const;
