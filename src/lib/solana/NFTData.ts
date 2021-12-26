import { Metadata } from "@metaplex/js";
import axios from "axios";
import { Connection } from "@solana/web3.js";

export default interface NFTData {
  name: string;
  image: string;
  attributes: Array<AttributesObject>;
}

interface AttributesObject {
  trait_type: string;
  value: string;
}

export async function fetchNFTData(
  web3Conn: Connection,
  token: string
): Promise<NFTData | undefined> {
  try {
    const metadata = await Metadata.load(
      web3Conn,
      await Metadata.getPDA(token)
    );
    return (await axios.get<NFTData>(metadata.data.data.uri)).data;
  } catch (e) {
    console.error("fetch NFT data failed", e);
  }
}
