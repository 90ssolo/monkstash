/**
 * The small part of the Chrome extension API this extension uses, typed by hand so the build
 * needs no extra dependency. Shapes follow developer.chrome.com/docs/extensions/reference/api.
 */
declare namespace chrome {
  namespace runtime {
    interface Port {
      name: string;
      sender?: MessageSender;
      postMessage(message: unknown): void;
      disconnect(): void;
      onMessage: Event<(message: unknown, port: Port) => void>;
      onDisconnect: Event<(port: Port) => void>;
    }
    interface MessageSender { url?: string; id?: string; documentId?: string }
    interface ExtensionContext { contextType: string; documentUrl?: string }
    const id: string;
    const lastError: { message?: string } | undefined;
    function connect(info?: { name?: string }): Port;
    function sendMessage<T = unknown>(message: unknown): Promise<T>;
    function getURL(path: string): string;
    function getManifest(): { version: string; name: string };
    function getContexts(filter: { contextTypes?: string[]; documentUrls?: string[] }): Promise<ExtensionContext[]>;
    const onConnect: Event<(port: Port) => void>;
    const onMessage: Event<(message: unknown, sender: MessageSender, sendResponse: (response?: unknown) => void) => boolean | void>;
    const onInstalled: Event<(details: { reason: string }) => void>;
    const onStartup: Event<() => void>;
  }
  interface Event<T extends (...args: never[]) => unknown> {
    addListener(cb: T): void;
    removeListener(cb: T): void;
  }
  namespace permissions {
    function request(p: { origins?: string[]; permissions?: string[] }): Promise<boolean>;
    function remove(p: { origins?: string[]; permissions?: string[] }): Promise<boolean>;
    function contains(p: { origins?: string[]; permissions?: string[] }): Promise<boolean>;
  }
  namespace offscreen {
    function createDocument(p: { url: string; reasons: string[]; justification: string }): Promise<void>;
    function closeDocument(): Promise<void>;
  }
  namespace sidePanel {
    function open(p: { windowId?: number; tabId?: number }): Promise<void>;
    function setPanelBehavior(p: { openPanelOnActionClick: boolean }): Promise<void>;
  }
  /** Firefox only (sidebar_action). */
  namespace sidebarAction {
    function open(): Promise<void>;
  }
  namespace idle {
    type IdleState = "active" | "idle" | "locked";
    function setDetectionInterval(seconds: number): void;
    const onStateChanged: Event<(state: IdleState) => void>;
  }
  namespace tabs {
    interface Tab { id?: number; windowId: number; url?: string }
    function create(p: { url: string; active?: boolean }): Promise<Tab>;
  }
  namespace windows {
    function getCurrent(): Promise<{ id?: number }>;
  }
}
