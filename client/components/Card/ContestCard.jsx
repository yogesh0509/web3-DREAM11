import React, { useEffect, useState } from "react";
import { useAccount } from 'wagmi'
import { readContract, simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast";
import { useRouter } from 'next/router'
import Countdown from 'react-countdown';
import { parseEther } from 'ethers';
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, onValue } from "firebase/database";
import { firebaseConfig } from "../../constants/firebaseConfig.js"
import { config } from "../../config.ts";

const abi = require("../../constants/abi.json")
const bid = parseEther("0.1");

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

export default function ContestCard(props) {

  const [conditionResult, setConditionResult] = useState(false)
  const [StartTime, setStartTime] = useState(0)
  const [EndTime, setEndTime] = useState(0)
  const { address } = useAccount()
  const router = useRouter()

  const GameAddress = props.Game
  const contractABI = JSON.parse(abi["Game"])

  useEffect(() => {
    isRegistered()
    updateUI()
  }, [address, conditionResult])

  const updateUI = () => {
    // onValue(ref(db, `/contests/${GameAddress}`), async (snapshot) => {
    //   console.log(snapshot.val())
    //   setStartTime(snapshot.val())

    //   const totalPlayers = await readContract({
    //     address: GameAddress,
    //     abi: contractABI,
    //     functionName: "s_totalplayerCount",
    //   })

    //   const auctionTime = await readContract({
    //     address: GameAddress,
    //     abi: contractABI,
    //     functionName: "s_auctionTime",
    //   })

    //   setEndTime(snapshot.val() + parseInt(totalPlayers) * parseInt(auctionTime) * 2)
    // }, {
    //   onlyOnce: true
    // });
  }

  const isRegistered = async () => {
    const data = await readContract(config, {
      address: GameAddress,
      abi: contractABI,
      functionName: "s_buyercheck",
      args: [address]
    })
    setConditionResult(data)
  }

  const register = async () => {
    toast.dismiss("connecting");
    toast.loading("Connecting with contract", {
      id: "connect",
    });
    console.log(GameAddress)
    try {
      const { request, result } = await simulateContract(config, {
        address: GameAddress,
        abi: contractABI,
        functionName: "register",
        value: bid
      });

      const { hash } = await writeContract(config, request);
      await waitForTransactionReceipt(config, { hash });
      toast.dismiss("connect");
      toast.success("Successfully registered");
      toast.custom("You'll be notified once approved", {
        icon: "ℹ️",
      });

      isRegistered()
    } catch (err) {
      toast.dismiss("connect");
      console.error(err);
      const data = await readContract(config, {
        address: GameAddress,
        abi: contractABI,
        functionName: "s_auctionState"
      })
      console.log(data)
      if (data) {
        toast.error("Either any auction is going on or all the auctions have already ended!!")
      }
      toast.error("Error connecting with contract");
    }
  }

  const enter = () => {
    router.push(`/contests/${GameAddress}`)
  }

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden group">
      <CardContent className="p-0 relative aspect-[3/4]">
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600" opacity-75 group-hover:opacity-100 transition-opacity`}></div>
        <img
          src="/assets/contest.png"
          alt="Contest Image"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
          <h4 className="text-white font-bold mb-2">
            Fee: 0.1 MATIC
          </h4>

          <h4 className="text-white font-bold mb-2">
            <span className="text-gray-400">
              Start Date:
            </span>
            <span className="text-white ml-2">
              <Countdown
                date={StartTime}
              />
            </span>
          </h4>
          <h4 className="text-white font-bold mb-2">
            <span className="text-gray-400">
              End Date:
            </span>
            <span className="text-white ml-2">
              <Countdown
                date={EndTime}
              />
            </span>
          </h4>
          {conditionResult ? (
            <Button className="bg-indigo-600 hover:bg-indigo-400 text-white font-medium py-2 px-4 rounded" onClick={enter}>
              Enter
            </Button>
          ) : (
            <Button className="bg-indigo-600 hover:bg-indigo-400 text-white font-medium py-2 px-4 rounded" onClick={register}>
              Register
            </Button>
          )}
        </div>
      </CardContent >
    </Card >
  );
};