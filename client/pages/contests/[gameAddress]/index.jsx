import React, { useEffect, useState, useContext } from "react"
import { useRouter } from 'next/router'
import { readContract } from "@wagmi/core"
import { useAccount, useContractEvent } from "wagmi"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Search } from "lucide-react"
import { ContractContext } from "../../../context/ContractContext"
import PlayerCard from "../../../components/Card/PlayerCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { config } from "../../../config"

const abi = require("../../../constants/abi.json")

export default function ContestsPage({ gameAddress }) {
  const { address } = useAccount()
  const [account] = useState(address)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  
  const { 
    PICAddress, 
    PICAddresssetup, 
    fetchTokens, 
    currentPlayer, 
    fetchcurrentPlayer 
  } = useContext(ContractContext)

  const PICcontractABI = JSON.parse(abi["PIC"])
  const GamecontractABI = JSON.parse(abi["Game"])

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        await PICAddresssetup(gameAddress)
        await fetchcurrentPlayer(gameAddress)
        await fetchTokens(gameAddress, address)
        if(PICAddress) {
          await fetchPlayers()
        }
      } catch (error) {
        console.error("Error initializing data:", error)
      } finally {
        setLoading(false)
      }
    }
    initializeData()
  }, [PICAddress])

  useEffect(() => {
    if (account !== address) {
      router.push("/")
    }
  }, [address])

//   useContractEvent({
//     address: gameAddress,
//     abi: GamecontractABI,
//     eventName: 'AuctionStarted',
//     listener(log) {
//       localStorage.setItem('time', Date.now().toString())
//       localStorage.setItem('state', 'false')
//     },
//   })

//   useContractEvent({
//     address: gameAddress,
//     abi: GamecontractABI,
//     eventName: 'AuctionEnded',
//     listener(log) {
//       localStorage.setItem('time', Date.now().toString())
//       localStorage.setItem('state', 'true')
//     },
//   })

  const fetchPlayers = async () => {
    try {
      const data = await readContract(config, {
        address: PICAddress,
        abi: PICcontractABI,
        functionName: "getTotalPlayers"
      })
      
      const count = parseInt(data)
      console.log(count)
      const playerPromises = Array.from({ length: count }, (_, i) => 
        readContract(config, {
          address: PICAddress,
          abi: PICcontractABI,
          functionName: "getplayerDetails",
          args: [i]
        })
      )
      
      const playerData = await Promise.all(playerPromises)
      setPlayers(playerData)
    } catch (error) {
      console.error("Error fetching players:", error)
    }
  }

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            </motion.div>
          ) : filteredPlayers.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  image={player.imageURI}
                  id={index}
                  role={player.role}
                  name={player.name}
                  currentPlayer={currentPlayer}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <h3 className="text-xl text-gray-400 mb-4">No players found</h3>
              <Button 
                onClick={fetchPlayers}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Refresh Players
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const gameAddress = context.params.gameAddress
  return {
    props: {
      gameAddress
    },
  }
}

