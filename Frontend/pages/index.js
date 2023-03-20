import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import Card from "../components/Card";
const ContractAbi = require("../constants/ContractAbi.json")

export default function IndexPage({ metadata, curr }) {

  return (
    <>
      <br />
      <Card metadata={metadata} curr={curr}/>
    </>
  )
}

export async function getServerSideProps(context) {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

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

  functionName = "getCurrentPlayerCount"
  const res = await Moralis.EvmApi.utils.runContractFunction({
    abi,
    functionName,
    address,
    chain: EvmChain.SEPOLIA,
  });
  const curr_auction_player = res.result

  return {
    props: {
      metadata: metadata,
      curr: curr_auction_player
    },
  };
}
