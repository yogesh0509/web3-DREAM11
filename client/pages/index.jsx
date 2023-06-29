import React from "react";
import { useEffect } from "react";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import ContestCard from "../components/Card/ContestCard";

const abi = require("../constants/abi.json")

export default function Index() {

  const { isConnected } = useAccount();
  useEffect(() => {
    if (isConnected) {
      fetchContests()
    }
}, [isConnected])

  async function fetchContests() {
    let abi = JSON.parse(abi["Marketplace"])
    let address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;

    const data = await readContract({
      address: address,
      abi: abi,
      functionName: "oracle"
    });

    console.log(data)
  }

  return (
    <>
      <ContestCard />
      <ContestCard /></>
  );
};
export async function getServerSideProps(context) {

  return {
    props: {

      gameImage: "https://example.com/competition1.jpg",
      gameTitle: "Example Competition 1",
      date: "May 15, 2023",
      time: "2:00 PM",
      entryFee: "$100",
      prizeMoney: "$1000",
      playersCount: "10"
    }
  }
}