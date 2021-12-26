import Discord, { TextChannel } from "discord.js";
import { Worker } from "./types";
import { Connection } from "@solana/web3.js";
import notifyDiscordListing from "lib/discord/notifyDiscordListing";
import axios from "axios";

export interface Project {
  mintAddress: string;
  discordChannelId: string;
  discordListingChannelId: string;
  collectionSymbol: string;
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

      const collection_symbol = project.collectionSymbol; //"0xdrip_banners";
      if(collection_symbol !== undefined){
        const listingChannel = (await discordClient.channels.fetch(
          project.discordListingChannelId
        )) as TextChannel;
        if (!listingChannel) {
          console.warn("Can't see listingChannel");
          return;
        }
        if (!listingChannel.send) {
          console.warn("listingChannel must be a TextChannel");
          return;
        }
      
      await axios.get(
        `https://api-mainnet.magiceden.io/rpc/getGlobalActivitiesByQuery?q={"$match":{"collection_symbol":"${collection_symbol}"},"$sort":{"blockTime":-1},"$skip":0}`)
        .then
        ((response: any) => {
            const data = response.data.results
            let foundNew = false
            let recent = []
            for(var i = 0; i < data.length; i++){
              if(new Date(data[i].blockTime * 1000) > lastNotified){
                if(data[i].txType == "initializeEscrow" ){
                  foundNew = true
                  recent.push(new Date(data[i].blockTime * 1000))
                  notifyDiscordListing(discordClient, listingChannel, data[i]);
                }
              } 
            }
            if(foundNew && recent.length){
              lastNotified = recent[0]
            }
        });
      }
      notifyAfter = lastNotified;
    },
  };
}
