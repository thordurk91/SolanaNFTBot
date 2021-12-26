import Discord, { MessageEmbed, TextChannel } from "discord.js";
import { NFTSale } from "lib/marketplaces";

const status: {
  totalNotified: number;
  lastNotified?: Date;
} = {
  totalNotified: 0,
};

export function getStatus() {
  return status;
}

export default async function notifyDiscordSale(
  client: Discord.Client,
  channel: TextChannel,
  nftSale: NFTSale
) {
  if (!client.isReady()) {
    return;
  }

  const { marketplace, nftData } = nftSale;
  console.log(nftData);
  const description = `Sold for ${nftSale.getPriceInSOL()} S◎L at ${
    marketplace.name
  }`;
  /*
  const embedMsg = new MessageEmbed({
    color: "#0099ff",
    title: nftData?.name,
    description,
    url: marketplace.itemURL(nftSale.token),
    thumbnail: {
      url: nftData?.image,
    },
  });
  */
 let FieldObject = []

  const NFTname = {
    name: 'Title',
    value: nftData?.name !== undefined ? nftData?.name : "",
  }
  FieldObject.push(NFTname)
  const priceData = {
      name: "Price",
      value: nftSale.getPriceInSOL() + " S◎L"
  }
  FieldObject.push(priceData)
  if(nftData?.attributes.length){
    for(var i = 0; i < nftData?.attributes.length; i++){
      const attr = {
          name: nftData?.attributes[i].trait_type !== undefined ? nftData?.attributes[i].trait_type : "",
          value: nftData?.attributes[i].value  !== undefined ? nftData?.attributes[i].value : "",
          inline: true
      }
      FieldObject.push(attr)
    }
  }

  const embedMsg = new MessageEmbed({
    color: "#0099ff",
    title: nftData?.name + ' was just sold!',
    fields: FieldObject,
    url: marketplace.itemURL(nftSale.token),
    image:{
      url: nftData?.image,
    },
    footer: {
        text: 'Activity monitor by Hundasupa',
        icon_url: 'https://thordurk91.github.io/hunda.png',
    }
  });

  await channel.send({
    embeds: [embedMsg],
  });
  const logMsg = `Notified discord #${channel.name}: ${nftData?.name} - ${description}`;
  console.log(logMsg);

  status.lastNotified = new Date();
  status.totalNotified++;
}
