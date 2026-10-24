/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.8",
  url: `${repoUrl}/releases/tag/extension-v0.1.8`,
  published: "2026-10-24",
  chrome: {
    version: "0.1.8",
    file: "monkstash-chrome-0.1.8.zip",
    sha256: "98fd6663a6a0a7dba2a952f0a020ec6e27f3810cc1569e5663a48fdc15273f49",
    fingerprint: "fbef9a5ce17e44be7fec2a4f1c8813a32e333a9fd5705adba466b72a38779759",
  },
  firefox: {
    version: "0.1.8",
    file: "monkstash-firefox-0.1.8.zip",
    sha256: "36666e197247e3efd247bf6ba20d5466800d55cd32aae15ede07eded513f44eb",
    fingerprint: "581ccd0b26cc94cdf5644878ff91b37b211bb8df453a2661498a092b0bd01b89",
  },
} as const;
