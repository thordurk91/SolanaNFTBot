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

    if(nftData.txType != "initializeEscrow"){
        return;
    }
    let price = 0
    let NFTtitle = ""
    let category = ""
    let type = ""
    let NFTimg = ""
    let FieldObject = []
    let attributes = [{"trait_type": "string", "value": "value"}] //dirty way to get matching expected array of attributes

    await axios.get(`https://api-mainnet.magiceden.io/rpc/getNFTByMintAddress/${nftListing.mint}`)
    .then((response:any) =>{
        const data = response.data.results
        if(data.price !== undefined) price = data.price
        if(data.title !== undefined) NFTtitle = data.title
        if(data.attributes[0]?.value !== undefined) category = data.attributes[0].value
        if(data.attributes[1]?.value !== undefined) type = data.attributes[1].value
        if(data.attributes.length) attributes = data.attributes;
        if(data.img !== undefined) NFTimg = data.img
    });
    if(price <= 0){
        return;
    }
    const TitleField =  {
      name: 'Title',
      value: NFTtitle,
    }
    FieldObject.push(TitleField)
    const PriceField = 
    {
        name: "Price",
        value: price + " S◎L"
    }
    FieldObject.push(PriceField)
    if(attributes !== undefined ){
      for(var y = 0; y < attributes.length; y++){
        const attr = {
          name: attributes[y].trait_type,
          value: attributes[y].value,
          inline: true
        }
        FieldObject.push(attr)
      }
    }

    const description = `Listed for ${price} S◎L`;
    const embedMsg = new MessageEmbed({
      color: "#0099ff",
      title: NFTtitle + ' was just listed!',
      fields: FieldObject,
      url: "https://www.magiceden.io/item-details/" + (nftListing.mint),
      image:{
        url: NFTimg,
      },
      footer: {
          text: 'Activity monitor by Hundasupa',
          icon_url: 'https://thordurk91.github.io/hunda.png',
      }
    });
    await channel.send({
      embeds: [embedMsg],
    });
    const logMsg = `Notified discord for listing #${channel.name}: ${NFTtitle} - ${description}`;
    console.log(logMsg);
  
    status.lastNotified = new Date();
    status.totalNotified++;
  }