import React, { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { useAccount, useContractEvent } from "wagmi";

import ContestCard from "../components/Card/ContestCard";
const abi = require("../constants/abi.json")

export default function Index() {

  const { address } = useAccount()
  const [Game, setGame] = useState([])

  const contractABI = JSON.parse(abi["GameFactory"])
  const Contractaddress = process.env.NEXT_PUBLIC_GAME_FACTORY_CONTRACT_ADDRESS

  useContractEvent({
    address: Contractaddress,
    abi: contractABI,
    eventName: 'GameCreated',
    listener(log) {
      console.log(log[0])
      console.log(log[0].args._GameAddress)
      // onValue(ref(db, `/contests/${log[0].args._GameAddress}`), (snapshot) => {
      //   return update(ref(db), { time: Date.now() + parseInt(log[0].args._auctionStartTime) * 1000 });
      // },
      //   {
      //     onlyOnce: true
      //   })
      console.log(log)
    },
  })

  useEffect(() => {
    if (address) {
      fetchContests()
    }
  }, [address, Game])

  async function fetchContests() {

    const data = await readContract({
      address: Contractaddress,
      abi: contractABI,
      functionName: "getAllGames",
    })
    const res = data.map(a => a.GameAddress)
    if (JSON.stringify(res) != JSON.stringify(Game)) {
      setGame(res)
    }
  }

  return (
    <>
      {
        Game.length != 0 ?
          Game.map((ele, id) => (
            <ContestCard Game={ele} key={id} />
          ))
          : <></>
      }
    </>
  );
};