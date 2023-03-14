import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import Card from "../components/Card";
const ethers = require("ethers")
const ContractAbi = require("../constants/ContractAbi.json")

export default function IndexPage({ metadata }) {
  return (
    <>
      <br />
      <Card metadata={metadata} />
    </>
  )
}

export async function getServerSideProps(context) {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

  let time = 0;
  let address = process.env.NEXT_PUBLIC_IDENTITYNFT_CONTRACT_ADDRESS;
  let functionName = "getTokenCounter"
  let abi = JSON.parse(ContractAbi["IdentityNft"])
  let response = await Moralis.EvmApi.utils.runContractFunction({
    abi,
    functionName,
    address,
    chain: EvmChain.SEPOLIA,
  });
  const total_players = response.result
  let metadata = []

  for (let i = 0; i < total_players; i++) {

    let tokenId = String(i)
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      address,
      chain: EvmChain.SEPOLIA,
      tokenId,
    });
    if (response) {
      metadata.push({
        nft: response.result.metadata,
        tokenId: i
      })
    }
  }

  address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
  abi = JSON.parse(ContractAbi["Marketplace"])

  const provider = new ethers.providers.WebSocketProvider(
    `wss://sepolia.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
  );
  const contract = new ethers.Contract(address, abi, provider);
  contract.on("AuctionEnded", (from, to, value, event) => {
    let transferEvent = {
      from: from,
      to: to,
      value: value,
      eventData: event,
    }
    time = 3600
    console.log(JSON.stringify(transferEvent, null, 4))
  })

  // functionName = "s_playerCount"
  // const res = await Moralis.EvmApi.utils.runContractFunction({
  //   abi,
  //   functionName,
  //   address,
  //   chain: EvmChain.SEPOLIA,
  // });
  // const curr_auction_player = res.result

  return {
    props: {
      metadata: metadata,
      // disabled: 0 // use curr_auction_player
    },
  };
}
