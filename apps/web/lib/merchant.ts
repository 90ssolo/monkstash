import { repoUrl } from "./site";

/**
 * Merchant tools: where to get them. Source links point into the open-source repository.
 * A null download means "not released yet", and the pages say so plainly instead of linking to nothing.
 */
export const merchant = {
  /** Source code of MonkStash Pay (the self-hosted gateway). */
  payRepoUrl: `${repoUrl}/tree/main/apps/pay`,
  /** Source code of the WooCommerce plugin, in the same repository. */
  wooSourceUrl: `${repoUrl}/tree/main/integrations/woocommerce`,
  /** Download of the WooCommerce plugin zip. Null until it has been tested on a real WordPress site. */
  wooPluginUrl: null as string | null,
  payVersion: "0.1",
  wooVersion: "0.1",
};
