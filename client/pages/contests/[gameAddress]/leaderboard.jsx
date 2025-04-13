'use client'

import React, { useEffect, useState, useContext } from "react"
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { ContractContext } from "@/context/ContractContext"
import LeaderboardTable from "@/components/LeaderboardTable"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trophy, Crown, Loader2, AlertCircle } from "lucide-react"
import { formatEther } from "ethers"
import { cn } from "@/lib/utils"

export default function Leaderboard({ GameAddress }) {
  const { address } = useAccount()
  const router = useRouter()
  const context = useContext(ContractContext)

  const [registrants, setRegistrants] = useState([])
  const [numPlayerPurchased, setNumPlayerPurchased] = useState([])
  const [playersBought, setPlayersBought] = useState([])
  const [winner, setWinner] = useState("")
  const [winnerAmount, setWinnerAmount] = useState(BigInt(0))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          buyers,
          winnerAddress,
        ] = await Promise.all([
          context.fetchBuyers(GameAddress),
          context.fetchWinner(GameAddress),
        ])

        setRegistrants(buyers)
        setWinner(winnerAddress)

        if (winnerAddress !== "0x0000000000000000000000000000000000000000") {
          const funds = await context.fetchWinnerFunds(GameAddress, winnerAddress)
          setWinnerAmount(funds)
        }

        const playerDataPromises = buyers.map(async (player) => {
          const count = await context.fetchBuyerTransactions(GameAddress, player)
          return count
        })

        const playerData = await Promise.all(playerDataPromises)
        setNumPlayerPurchased(playerData)
      } catch (error) {
        console.error("Error initializing leaderboard:", error)
        setError("Failed to load leaderboard data")
        toast.error("Failed to load leaderboard data")
      } finally {
        setLoading(false)
      }
    }

    if (GameAddress) {
      init()
    }
  }, [GameAddress, address])

  const filteredRegistrants = registrants.filter(registrant => 
    registrant.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.reload()} className="bg-purple-500 hover:bg-purple-600">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
              Leaderboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {winner !== "0x0000000000000000000000000000000000000000" && (
              <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">
                  Winner: {winner.slice(0, 6)}...{winner.slice(-4)} ({formatEther(winnerAmount)} ETH)
                </span>
              </div>
            )}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-gray-800 text-white border-gray-700"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
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