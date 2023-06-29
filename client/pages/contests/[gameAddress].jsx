
// import Card from "../components/Card";
import PlayerCard from "../../components/PlayerCard";
// const ContractAbi = require("../constants/ContractAbi.json")

export default function IndexPage({ metadata, curr }) {

  return (
    <>
      <br />
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <PlayerCard />
            <PlayerCard />
          </div>

        </div>
      </div>
      {/* <Navbar /> */}
      {/* <Card metadata={metadata} curr={curr}/> */}
    </>
  )
}

export async function getServerSideProps(context) {

  // let address = process.env.NEXT_PUBLIC_IDENTITYNFT_CONTRACT_ADDRESS;
  // let functionName = "getTokenCounter"
  // let abi = JSON.parse(ContractAbi["IdentityNft"])
  // let response = await Moralis.EvmApi.utils.runContractFunction({
  //   abi,
  //   functionName,
  //   address,
  //   chain: EvmChain.MUMBAI,
  // });
  // const total_players = response.result
  // let metadata = []

  // for (let i = 0; i < total_players; i++) {

  //   let tokenId = String(i)
  //   const response = await Moralis.EvmApi.nft.getNFTMetadata({
  //     address,
  //     chain: EvmChain.MUMBAI,
  //     tokenId,
  //   });
  //   if (response) {
  //     metadata.push({
  //       nft: response.result.metadata,
  //       tokenId: i
  //     })
  //   }
  // }

  // address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
  // abi = JSON.parse(ContractAbi["Marketplace"])

  // functionName = "getCurrentPlayerCount"
  // const res = await Moralis.EvmApi.utils.runContractFunction({
  //   abi,
  //   functionName,
  //   address,
  //   chain: EvmChain.MUMBAI,
  // });
  // const curr_auction_player = res.result
  return {
    props: {
      metadata: "",
      curr: ""
    },
  };
  // return {
  //   props: {
  //     metadata: metadata,
  //     curr: curr_auction_player
  //   },
  // };
}
