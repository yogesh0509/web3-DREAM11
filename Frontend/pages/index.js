import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import Card from "../components/Card";

const ContractAbi = require("../constants/ContractAbi.json")

export default function IndexPage({ metadata }) {
  return (
    <>
      <br />
      <Card metadata={metadata}/>
    </>
  )
}

export async function getServerSideProps(context) {
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

  const address = process.env.NEXT_PUBLIC_IDENTITYNFT_CONTRACT_ADDRESS;

  let functionName = "getTokenCounter"
  const abi = JSON.parse(ContractAbi["IdentityNft"])
  const response = await Moralis.EvmApi.utils.runContractFunction({
    abi,
    functionName,
    address,
    chain: EvmChain.GOERLI,
  });
  const total_players = response.result
  let metadata = []

  for (let i = 0; i < total_players; i++) {

    let tokenId = String(i)
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      address,
      chain: EvmChain.GOERLI,
      tokenId,
    });
    if (response) {
      metadata.push({
        nft: response.result.metadata,
        tokenId: i
      })
    }
  }

  // functionName = "s_playerCount"
  // const res = await Moralis.EvmApi.utils.runContractFunction({
  //   abi,
  //   functionName,
  //   address,
  //   chain: EvmChain.GOERLI,
  // });
  // const curr_auction_player = res.result

  return {
    props: {
      metadata: metadata,
      // disabled: 0 // use curr_auction_player
    },
  };
}
