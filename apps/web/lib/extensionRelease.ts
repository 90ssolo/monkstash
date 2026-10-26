/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.15",
  url: `${repoUrl}/releases/tag/extension-v0.1.15`,
  published: "2026-10-26",
  chrome: {
    version: "0.1.15",
    file: "monkstash-chrome-0.1.15.zip",
    sha256: "547fdaa1811d8a1aa416209c62fc73919d1f303f4f8820db68f86d87e87c0296",
    fingerprint: "b5b50ce0355ef0e1bc27ddf35ccd88806042527a8753f9787f04960f20f6222a",
  },
  firefox: {
    version: "0.1.15",
    file: "monkstash-firefox-0.1.15.zip",
    sha256: "38375eb21aa8941f73d153d0409b80fcd89524ba319d814df6dabe12b144c01d",
    fingerprint: "a84d2826c3deabdd8320118283c5442ac783e56f481a2e59d802adc20f891431",
  },
} as const;
