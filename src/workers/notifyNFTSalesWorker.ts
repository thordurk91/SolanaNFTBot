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

      await axios.get(
        'https://api-mainnet.magiceden.io/rpc/getGlobalActivitiesByQuery?q=%7B%22%24match%22%3A%7B%22collection_symbol%22%3A%220xdrip_banners%22%7D%2C%22%24sort%22%3A%7B%22blockTime%22%3A-1%7D%2C%22%24skip%22%3A0%7D')
        .then
        ((response: any) => {
            //console.log(response.data)
            const data = response.data.results
            //console.log(data.length);
            for(var i = 0; i < data.length; i++){
              //console.log(data[i].blockTime)
              //console.log(new Date(data[i].blockTime * 1000), ' > ', lastNotified)
              if(new Date(data[i].blockTime * 1000) > lastNotified){
                if(data[i].txType == "initializeEscrow" ) lastNotified = new Date(data[i].blockTime * 1000);
                console.log('item is new!', lastNotified)
                //console.log(data[i])
                notifyDiscordListing(discordClient, channel, data[i]);
              } 
            }
        });
        /*
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
          //Notify discord pending
          //await notifyTwitterSale(nftSale);

          if (nftSale.soldAt > lastNotified) {
            lastNotified = nftSale.soldAt;
          }
        },
      });
      */
      notifyAfter = lastNotified;
    },
  };
}
