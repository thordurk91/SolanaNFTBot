import axios from "axios";
import Discord, { MessageEmbed, TextChannel } from "discord.js";
import { NFTListing } from "lib/marketplaces";

const status: {
  totalNotified: number;
  lastNotified?: Date;
} = {
  totalNotified: 0,
};

export function getStatus() {
  return status;
}

export default async function notifyDiscordListing(
    client: Discord.Client,
    channel: TextChannel,
    nftListing: NFTListing
  ) {
    if (!client.isReady()) {
      return;
    }
  
    const nftData = nftListing;

    if(nftData.txType == "cancelEscrow"){
        return;
    }
    let price = 0
    let NFTtitle = ""
    let category = ""
    let type = ""
    let NFTimg = ""
    await axios.get(`https://api-mainnet.magiceden.io/rpc/getNFTByMintAddress/${nftListing.mint}`)
    .then((response:any) =>{
        const data = response.data.results
        if(data.price !== undefined) price = data.price
        if(data.title !== undefined) NFTtitle = data.title
        if(data.attributes[0]?.value !== undefined) category = data.attributes[0].value
        if(data.attributes[1]?.value !== undefined) type = data.attributes[1].value
        if(data.img !== undefined) NFTimg = data.img
    });
    const description = `Listed for ${price} S◎L at magicEden. ${category} - ${type}`;
    const embedMsg = new MessageEmbed({
      color: "#0099ff",
      title: NFTtitle,
      description,
      url: "https://www.magiceden.io/item-details/" + (nftListing.mint),
      thumbnail: {
        url: NFTimg,
      },
    });
    await channel.send({
      embeds: [embedMsg],
    });
    const logMsg = `Notified discord for listing #${channel.name}: ${NFTtitle} - ${description}`;
    console.log(logMsg);
  
    status.lastNotified = new Date();
    status.totalNotified++;
  }