import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import {
  readContract
} from "wagmi/actions"
import { useAccount } from "wagmi"

import PlayerCard from "../../../components/Card/PlayerCard";
const abi = require("../../../constants/abi.json")

export default function IndexPage({ GameAddress }) {

  const { address } = useAccount()
  const [Players, setPlayers] = useState([])
  const [account, setAccount] = useState(address)

  const router = useRouter()

  const PICcontractABI = JSON.parse(abi["PIC"])
  const GamecontractABI = JSON.parse(abi["Game"])

  useEffect(() => {
    fetchPlayers()
  }, [])

  useEffect(() => {
    if (account != address) {
      router.push("/")
    }
  }, [address])

  const fetchPlayers = async () => {
    let data = await readContract({
      address: GameAddress,
      abi: GamecontractABI,
      functionName: "getPICContract"
    })
    const PICAddress = data;

    data = await readContract({
      address: PICAddress,
      abi: PICcontractABI,
      functionName: "getTotalPlayers"
    })
    const count = parseInt(data);
    let arr = []
    for (let i = 0; i < count; i++) {
      data = await readContract({
        address: PICAddress,
        abi: PICcontractABI,
        functionName: "getplayerDetails",
        args: [i]
      })
      arr.push(data)
    }
    console.log(arr)
    setPlayers(arr)
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
          {Players.map((ele, index) => (
            < PlayerCard GameAddress={GameAddress} image={ele.imageURI} id={index} key={ele.id} />
          ))}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {

  const GameAddress = context.params.gameAddress

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
      GameAddress: GameAddress
    },
  };
}
