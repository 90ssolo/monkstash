/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.4",
  url: `${repoUrl}/releases/tag/extension-v0.1.4`,
  published: "2026-10-23",
  chrome: {
    version: "0.1.4",
    file: "monkstash-chrome-0.1.4.zip",
    sha256: "d39ee6b1b295e771b583eea6bca70a636f0fb9c57ed0a0bb0eabb390c998d403",
    fingerprint: "5443780b4ed077d86d9503b56f4e8e7a8416d507280c3716b3fe49b8daa5cf76",
  },
  firefox: {
    version: "0.1.4",
    file: "monkstash-firefox-0.1.4.zip",
    sha256: "dc74753ba191a4f605de9aebfca73999adf49699f0f010c12610bffea8a4479d",
    fingerprint: "8c90999b987f46ab868d6a7cdbbb7307170153bf99416b81c7b9b209e50f1f1c",
  },
} as const;
