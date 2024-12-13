import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAccount } from 'wagmi'
import { readContract, simulateContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast";
import { useRouter } from 'next/router'
import Countdown from 'react-countdown';
import { parseEther } from 'ethers';
import { motion } from "framer-motion";
import { Clock, Trophy, Coins } from "lucide-react";

const abi = require("../../constants/abi.json")
const bid = parseEther("0.1");

// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, onValue } from "firebase/database";
import { firebaseConfig } from "../../constants/firebaseConfig.js"
import { config } from "../../config.ts";

const CountdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    return <span className="text-red-400">Expired</span>;
  }
  
  return (
    <div className="flex gap-2 items-center">
      {days > 0 && <span>{days}d</span>}
      <span>{String(hours).padStart(2, '0')}h</span>
      <span>{String(minutes).padStart(2, '0')}m</span>
      <span>{String(seconds).padStart(2, '0')}s</span>
    </div>
  );
};

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
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-gray-800 border-gray-700 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-0 relative aspect-[3/4]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-600/90 opacity-75 group-hover:opacity-90 transition-opacity duration-300"></div>
          <img
            src="/assets/contest.png"
            alt="Contest Image"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            {/* Top Section */}
            <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold">Prize Pool</span>
                </div>
                <span className="text-white font-bold">1000 MATIC</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-400" />
                <span className="text-white font-bold">Entry Fee:</span>
                <span className="text-white">0.1 MATIC</span>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="space-y-4 bg-black/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Starts in:</span>
                  </div>
                  <span className="text-white font-medium">
                    <Countdown date={StartTime} renderer={CountdownRenderer} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Ends in:</span>
                  </div>
                  <span className="text-white font-medium">
                    <Countdown date={EndTime} renderer={CountdownRenderer} />
                  </span>
                </div>
              </div>

              {conditionResult ? (
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transform transition-all duration-200 hover:scale-[1.02]"
                  onClick={enter}
                >
                  Enter Contest
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transform transition-all duration-200 hover:scale-[1.02]"
                  onClick={register}
                >
                  Register Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};