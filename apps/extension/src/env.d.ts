/** Build-time constants (vite.config.ts `define`). */
/** True in the Firefox build: the host page is the background page, there is no service worker. */
declare const __FIREFOX__: boolean;
/** True only in stagenet test builds: exposes a test hook on the host page. */
declare const __TEST_BUILD__: boolean;
