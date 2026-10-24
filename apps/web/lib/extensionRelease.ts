/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.9",
  url: `${repoUrl}/releases/tag/extension-v0.1.9`,
  published: "2026-10-24",
  chrome: {
    version: "0.1.9",
    file: "monkstash-chrome-0.1.9.zip",
    sha256: "7f8e345f9fbc00302cea162789f9994dadc6fd43a3966d99dab12a4208fedfee",
    fingerprint: "da34b779880a3ca7b54f895c5e4e20eb9a48b3e83f2094581451ededfe9588f0",
  },
  firefox: {
    version: "0.1.9",
    file: "monkstash-firefox-0.1.9.zip",
    sha256: "1fdd1445eddd440fce9db23a7557d8e685ae9a0f057b8e42ed045183a6ce9765",
    fingerprint: "74becf056c91f79d4368d4a38f8199d4cb3ce59317a4f899c6ed1698c4696406",
  },
} as const;
