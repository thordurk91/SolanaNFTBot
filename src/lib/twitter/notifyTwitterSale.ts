import { NFTSale } from "lib/marketplaces";


export default async function(
  nftSale: NFTSale
){
const Twitter = require("twitter")
const dotenv = require("dotenv")
const axios = require("axios")
const fs = require("fs")
dotenv.config()
const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const { marketplace, nftData } = nftSale;

const title = nftData?.name;
const description = title + ` just sold for ${nftSale.getPriceInSOL()} S◎L at ${
  marketplace.name
}!`;
const marketplaceurl = marketplace.itemURL(nftSale.token);
//const imageData = fs.readFileSync("./media/george.jpg") //replace with the path to your image
const imageData = nftData?.image;
interface ServerResponse {
  data: ServerData
}

interface ServerData {
  foo: string
  bar: number
}
const imageBaseData = await axios.get(imageData, {
      responseType: 'arraybuffer',
    })
    .then((response : any) => Buffer.from(response.data, 'binary').toString('base64'))
//console.log('imageBaseData', imageBaseData)
client.post("media/upload", {media: imageBaseData}, function(error :any, media : any, response :any) {
  if (error) {
    console.log(error)
    return;
  } else {
    const status = {
      status: description,
      media_ids: media.media_id_string
    }
    console.log(status)
    /*
    client.post("statuses/update", status, function(error: any, tweet : any, response : any) {
      if (error) {
        console.log(error)
        return;
      } else {
        console.log("Successfully tweeted a sale with an image!")
      }
    })
    */
  }
});
}