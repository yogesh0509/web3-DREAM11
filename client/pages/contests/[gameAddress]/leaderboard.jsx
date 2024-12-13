'use client'

import React, { useEffect, useState, useContext } from "react"
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { ContractContext } from "@/context/ContractContext"
import LeaderboardTable from "@/components/LeaderboardTable"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trophy, Crown } from "lucide-react"

const abi = require("@/constants/abi.json")

export default function Leaderboard({ GameAddress }) {
  const { address } = useAccount()
  const router = useRouter()
  const GamecontractABI = JSON.parse(abi["Game"])
  const { fetchTokens } = useContext(ContractContext)

  const [registrants, setRegistrants] = useState([])
  const [numPlayerPurchased, setNumPlayerPurchased] = useState([])
  const [playersBought, setPlayersBought] = useState([])
  const [winner, setWinner] = useState("")
  const [winnerAmount, setWinnerAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const init = async () => {
      if (address) {
        await fetchLeaderboard()
        await fetchTokens(GameAddress, address)
      }
    }
    init()
  }, [address, GameAddress])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const buyers = await readContract({
        address: GameAddress,
        abi: GamecontractABI,
        functionName: "getBuyers",
      })
      setRegistrants(buyers)

      const playerDataPromises = buyers.map(async (player) => {
        const [countResponse, playerDetailsResponse] = await Promise.all([
          readContract({
            address: GameAddress,
            abi: GamecontractABI,
            functionName: "s_BuyerTransactionCount",
            args: [player],
          }),
          readContract({
            address: GameAddress,
            abi: GamecontractABI,
            functionName: "fetchPlayers",
            args: [player],
          })
        ])

        return {
          count: parseInt(countResponse),
          playerDetails: playerDetailsResponse,
        }
      })

      const playerData = await Promise.all(playerDataPromises)
      setNumPlayerPurchased(playerData.map(item => item.count))
      setPlayersBought(playerData.map(item => item.playerDetails))

      const winnerAddress = await readContract({
        address: GameAddress,
        abi: GamecontractABI,
        functionName: "s_winner",
      })
      setWinner(winnerAddress)

      if (winnerAddress !== "0x0000000000000000000000000000000000000000") {
        const winnerFunds = await readContract({
          address: GameAddress,
          abi: GamecontractABI,
          functionName: "s_winnerFunds",
          args: [winnerAddress],
        })
        setWinnerAmount(parseInt(winnerFunds))
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      toast.error("Failed to load leaderboard data")
    } finally {
      setLoading(false)
    }
  }

  const filteredRegistrants = registrants.filter(registrant => 
    registrant.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Leaderboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {winner !== "0x0000000000000000000000000000000000000000" && (
              <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">Winner Found!</span>
              </div>
            )}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -z-10">
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"
          />
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-xl shadow-xl"
            >
              <LeaderboardTable
                registrants={filteredRegistrants}
                numPlayerPurchased={numPlayerPurchased}
                playersBought={playersBought}
                winner={winner}
                winnerAmount={winnerAmount}
                gameAddress={GameAddress}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const GameAddress = context.params.gameAddress
  return {
    props: {
      GameAddress
    },
  }
}