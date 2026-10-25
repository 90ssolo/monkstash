/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.12",
  url: `${repoUrl}/releases/tag/extension-v0.1.12`,
  published: "2026-10-25",
  chrome: {
    version: "0.1.12",
    file: "monkstash-chrome-0.1.12.zip",
    sha256: "6a35e4fecac18d0001c70a033717016036dbe3576e29e10e60b76d51d55c6b97",
    fingerprint: "d2f3e1818eb999f2522b236de5cdec2f768f32181df5f15a7c4bca186154f970",
  },
  firefox: {
    version: "0.1.12",
    file: "monkstash-firefox-0.1.12.zip",
    sha256: "fa8e051215915e90a1fcbb4444359aea16a451eebff1ed98ebbdede904b76da3",
    fingerprint: "95b71a714afcd52ef7772cda86c127e5429c0e6107a5083e8d3e15d9b0bcfcd5",
  },
} as const;
