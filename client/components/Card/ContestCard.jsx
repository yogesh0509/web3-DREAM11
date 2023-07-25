import React, { useEffect, useState } from "react";
import { ethers } from "ethers"
import { useAccount } from 'wagmi'
import {
  prepareWriteContract,
  readContract,
  waitForTransaction,
  writeContract,
} from "wagmi/actions"
import toast from "react-hot-toast";
import { useRouter } from 'next/router'
import Countdown from 'react-countdown';
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, onValue } from "firebase/database";
import {firebaseConfig} from "../../constants/firebaseConfig.js"

const abi = require("../../constants/abi.json")
const bid = ethers.utils.parseEther("0.1")

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
    const data = await readContract({
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
    try {
      const { request, result } = await prepareWriteContract({
        address: GameAddress,
        abi: contractABI,
        functionName: "register",
        value: bid
      });

      const { hash } = await writeContract(request);
      await waitForTransaction({ hash });
      toast.dismiss("connect");
      toast.success("Successfully registered");
      toast.custom("You'll be notified once approved", {
        icon: "ℹ️",
      });

      isRegistered()
    } catch (err) {
      toast.dismiss("connect");
      console.error(err);
      const data = await readContract({
        address: GameAddress,
        abi: contractABI,
        functionName: "s_auctionState"
      })
      console.log(data)
      if(data){
        toast.error("Either any auction is going on or all the auctions have already ended!!")
      }
      toast.error("Error connecting with contract");
    }
  }

  const enter = () => {
    router.push(`/contests/${GameAddress}`)
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:w-48 mt-8"
              src="/assets/contest.png"
              alt="Contest Image"
            />
          </div>
          <div className="p-4">
            <div className="uppercase tracking-wide text-medium text-indigo-500 font-semibold">
              Fee: 0.1 MATIC
            </div>
            <p className="mt-2 text-gray-300">
              Bidding battles and winning prizes through competitive auctions.
            </p>

            <div className="mt-4">
              <span className="text-gray-400">
                Start Date:
              </span>
              <span className="text-white ml-2">
                <Countdown
                  date={StartTime}
                />
              </span>
            </div>
            <div className="mt-2">
              <span className="text-gray-400">
                End Date:
              </span>
              <span className="text-white ml-2">
                <Countdown
                  date={EndTime}
                />
              </span>
            </div>
            <div className="mt-4">
              <a href="#" className="text-indigo-600 hover:text-indigo-400 font-medium">
                Learn More
              </a>
            </div>
            <div className="mt-4">
              {conditionResult ? (
                <button className="bg-indigo-600 hover:bg-indigo-400 text-white font-medium py-2 px-4 rounded" onClick={enter}>
                  Enter
                </button>
              ) : (
                <button className="bg-indigo-600 hover:bg-indigo-400 text-white font-medium py-2 px-4 rounded" onClick={register}>
                  Register
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};