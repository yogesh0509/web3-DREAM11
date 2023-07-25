import React, { useEffect, useState, useContext } from "react"
import { useRouter } from 'next/router'
import { readContract } from "wagmi/actions"
import { useAccount, useContractEvent } from "wagmi"
import { ContractContext } from "../../../context/ContractContext"
import PlayerCard from "../../../components/Card/PlayerCard"

const abi = require("../../../constants/abi.json")

export default function IndexPage({ gameAddress }) {

  const { address } = useAccount()
  const [account] = useState(address)
  const [Players, setPlayers] = useState([])
  const router = useRouter()
  const { PICAddress, PICAddresssetup, fetchTokens, currentPlayer, fetchcurrentPlayer } = useContext(ContractContext);

  const PICcontractABI = JSON.parse(abi["PIC"])
  const GamecontractABI = JSON.parse(abi["Game"])

  useEffect(() => {
    const func = async () => {
      await PICAddresssetup(gameAddress)
      await fetchcurrentPlayer(gameAddress)
      await fetchTokens(gameAddress, address)
      if(PICAddress)
        await fetchPlayers()
    }
    func()
  }, [PICAddress])

  useEffect(() => {
    if (account != address)
      router.push("/")
  }, [address])

  useContractEvent({
    address: gameAddress,
    abi: GamecontractABI,
    eventName: 'AuctionStarted',
    listener(log) {
      console.log(log)
      localStorage.setItem('time', Date.now())
      localStorage.setItem('state', 'false')
    },
  })

  useContractEvent({
    address: gameAddress,
    abi: GamecontractABI,
    eventName: 'AuctionEnded',
    listener(log) {
      console.log(log)
      localStorage.setItem('time', Date.now())
      localStorage.setItem('state', 'true')
    },
  })

  const fetchPlayers = async () => {
    let arr = []
    let data = await readContract({
      address: PICAddress,
      abi: PICcontractABI,
      functionName: "getTotalPlayers"
    })
    const count = parseInt(data)
    for (let i = 0; i < count; i++) {
      data = await readContract({
        address: PICAddress,
        abi: PICcontractABI,
        functionName: "getplayerDetails",
        args: [i]
      })
      arr.push(data)
    }
    setPlayers(arr)
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
          {Players.map((ele, index) => (
            < PlayerCard key={ele.id} image={ele.imageURI} id={index} role={ele.role} name={ele.name} currentPlayer={currentPlayer}/>
          ))}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {

  const gameAddress = context.params.gameAddress

  return {
    props: {
      gameAddress: gameAddress
    },
  };
}
