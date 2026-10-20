/**
 * The published browser extension release: the one place its version, files and checksums are
 * written. The extension page shows these so people can check a download before installing it.
 * Update together with a new GitHub release.
 */
import { repoUrl } from "./site";

export const extensionRelease = {
  tag: "extension-v0.1.1",
  url: `${repoUrl}/releases/tag/extension-v0.1.1`,
  published: "2026-10-20",
  chrome: {
    version: "0.1.0",
    file: "monkstash-chrome-0.1.0.zip",
    sha256: "b9118641736db8b85d9908a29f9bc35500848e6732ce5c24f7ac37b608995248",
    fingerprint: "f6abdc1e064a44d3e3a8c5556493e2855fc597f3361cc5c4c3d67c389bd8ca62",
  },
  firefox: {
    version: "0.1.1",
    file: "monkstash-firefox-0.1.1.zip",
    sha256: "c0f70e2f1e39d4b221694134ccc86efbbf68adc6a056539114fa7f07c7c84914",
    fingerprint: "4fd91b0fce6a7ad4b38e903979be70afeff1329faa353707cce4e6e8e6f75144",
  },
} as const;
