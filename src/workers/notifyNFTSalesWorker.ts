import Discord, { TextChannel } from "discord.js";
import { Worker } from "./types";
import { Connection } from "@solana/web3.js";
import { fetchWeb3Transactions } from "lib/solana/connection";
import { parseNFTSale } from "lib/marketplaces";
import { fetchNFTData } from "lib/solana/NFTData";
import notifyDiscordSale from "lib/discord/notifyDiscordSale";
import notifyDiscordListing from "lib/discord/notifyDiscordListing";
import notifyTwitterSale from "lib/twitter/notifyTwitterSale";
import axios from "axios";

export interface Project {
  mintAddress: string;
  discordChannelId: string;
}

export default function newWorker(
  discordClient: Discord.Client,
  web3Conn: Connection,
  project: Project
): Worker {
  const timestamp = Date.now();
  let notifyAfter = new Date(timestamp);
  let lastNotified = new Date(timestamp);
  return {
    async execute() {
      if (!discordClient.isReady()) {
        return;
      }

      const channel = (await discordClient.channels.fetch(
        project.discordChannelId
      )) as TextChannel;
      if (!channel) {
        console.warn("Can't see channel");
        return;
      }
      if (!channel.send) {
        console.warn("Channel must be a TextChannel");
        return;
      }

      
      
      await fetchWeb3Transactions(web3Conn, project.mintAddress, {
        limit: 10,
        async onTransaction(tx) {
          const nftSale = parseNFTSale(tx);
          if (!nftSale) {
            return;
          }
          // Don't notify purchases by the project's own account
          if (nftSale.buyer === project.mintAddress) {
            return;
          }
          if (nftSale.soldAt <= notifyAfter) {
            // ignore transactions before the last notify or last online time
            return false;
          }
          

          const nftData = await fetchNFTData(web3Conn, nftSale.token);
          if (!nftData) {
            return false;
          }

          nftSale.nftData = nftData;

          await notifyDiscordSale(discordClient, channel, nftSale);
          //await notifyTwitterSale(nftSale);

          if (nftSale.soldAt > lastNotified) {
            lastNotified = nftSale.soldAt;
          }
        },
      });
      
      notifyAfter = lastNotified;
    },
  };
}
