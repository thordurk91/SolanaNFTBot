export interface Subscription {
  discordChannelId: string;
  type: "NFTSale";
  mintAddress: string;
  discordListingChannelId: string;
  collectionSymbol: string;
  salesOnly: string;
  listingsOnly: string;
  salesAndListingsByCollectionId: string;

}
export interface Config {
  subscriptions: Subscription[];
}

export interface MutableConfig extends Config {
  setSubscriptions(subscriptions: Subscription[]): Promise<void>;
  addSubscription(subscription: Subscription): Promise<void>;
}

const config: Config = {
  subscriptions: [],
};

export default config;

export function loadConfig(): MutableConfig {
  /**
   * Load config from permanent storage
   */

  if (
    process.env.SUBSCRIPTION_MINT_ADDRESS &&
    process.env.SUBSCRIPTION_DISCORD_CHANNEL_ID &&  
    process.env.MAGICEDEN_SYMBOL &&
    process.env.LISTING_DISCORD_CHANNEL_ID &&
    process.env.SALES_ONLY &&
    process.env.LISTINGS_ONLY && 
    process.env.SALES_AND_LISTINGS_BY_COLLECTION_ID
  ) {
    config.subscriptions.push({
      type: "NFTSale",
      discordChannelId: process.env.SUBSCRIPTION_DISCORD_CHANNEL_ID,
      mintAddress: process.env.SUBSCRIPTION_MINT_ADDRESS,
      discordListingChannelId: process.env.LISTING_DISCORD_CHANNEL_ID,
      collectionSymbol: process.env.MAGICEDEN_SYMBOL,
      salesOnly: process.env.SALES_ONLY,
      listingsOnly: process.env.LISTINGS_ONLY,
      salesAndListingsByCollectionId: process.env.SALES_AND_LISTINGS_BY_COLLECTION_ID
    });
  }
  

  return {
    ...config,
    async setSubscriptions(subscriptions: Subscription[]): Promise<void> {
      this.subscriptions = subscriptions;
    },
    async addSubscription(subscription: Subscription): Promise<void> {
      this.subscriptions.push(subscription);
    },
  };
}
