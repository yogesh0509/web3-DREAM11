import React, { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { useAccount, useContractEvent } from "wagmi";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, push, update } from "firebase/database";

import ContestCard from "../components/Card/ContestCard";

const abi = require("../constants/abi.json")
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://auctionhouse-7ca3f-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function Index() {

  const { isConnected } = useAccount()
  const [isGame, setGame] = useState([])

  const contractABI = JSON.parse(abi["GameFactory"])
  const address = process.env.NEXT_PUBLIC_GAME_FACTORY_CONTRACT_ADDRESS

  useContractEvent({
    address: address,
    abi: contractABI,
    eventName: 'GameCreated',
    listener(log) {
      let address = ""
      let Starttime = ""

      onValue(ref(db, `/contests/${address}`), (snapshot) => {
        return update(ref(db), Date.now() + Starttime * 1000);
      },
        {
          onlyOnce: true
        })
      console.log(log)
    },
  })

  useEffect(() => {
    if (isConnected) {
      fetchContests()
    }
  }, [isConnected])

  async function fetchContests() {

    const data = await readContract({
      address: address,
      abi: contractABI,
      functionName: "GameStorage",
      args: [0]
    })
    setGame([...isGame, data])
  }

  return (
    <>
      {isGame.map((ele, id) => (
        <ContestCard Game = {ele[0]} key = {id}/>
      ))}
    </>
  );
};