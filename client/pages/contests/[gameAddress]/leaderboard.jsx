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
import { readContract } from "@wagmi/core";
import { config } from "../../../config";
import GameABI from "../../../constants/Game.json";
import { Search, Trophy, Crown, Loader2, AlertCircle, ClipboardCheck } from "lucide-react"
import { formatEther } from "ethers"
import { cn } from "@/lib/utils"
import { 
  fetchBuyers, 
  fetchWinner, 
  fetchWinnerFunds, 
  fetchBuyerTransactions, 
  fetchPlayersBought, 
  fetchTeamScore,
  getPICContract
} from "@/utils/contractUtils"

export default function Leaderboard({ GameAddress }) {
  const { address } = useAccount()
  const router = useRouter()
  const context = useContext(ContractContext)

  const [registrants, setRegistrants] = useState([])
  const [numPlayerPurchased, setNumPlayerPurchased] = useState([])
  const [playersBought, setPlayersBought] = useState([])
  const [teamScores, setTeamScores] = useState([])
  const [winner, setWinner] = useState("")
  const [winnerAmount, setWinnerAmount] = useState(BigInt(0))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [picAddress, setPicAddress] = useState("")
  const [gameUnlocked, setGameUnlocked] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get PIC contract address
        const picContractAddress = await getPICContract(GameAddress)
        setPicAddress(picContractAddress)

        // Check if game is unlocked (winner determined)
        const unlockStatus = await readContract(config, {
          address: GameAddress,
          abi: GameABI,
          functionName: "s_unlock",
        })
        
        setGameUnlocked(Boolean(unlockStatus))

        const [
          buyers,
          winnerAddress,
        ] = await Promise.all([
          fetchBuyers(GameAddress),
          fetchWinner(GameAddress),
        ])

        setRegistrants(buyers)
        setWinner(winnerAddress)

        if (winnerAddress !== "0x0000000000000000000000000000000000000000") {
          const funds = await fetchWinnerFunds(GameAddress, winnerAddress)
          setWinnerAmount(funds)
        }

        // Get player purchase counts
        const playerDataPromises = buyers.map(async (player) => {
          const count = await fetchBuyerTransactions(GameAddress, player)
          return count
        })

        // Get team scores for each buyer
        const teamScorePromises = buyers.map(async (player) => {
          const score = await fetchTeamScore(GameAddress, player)
          return score
        })

        // Get players bought by each buyer
        const playersBoughtPromises = buyers.map(async (player) => {
          const playerData = await fetchPlayersBought(GameAddress, player)
          return playerData
        })

        const [playerData, scores, boughtPlayers] = await Promise.all([
          Promise.all(playerDataPromises),
          Promise.all(teamScorePromises),
          Promise.all(playersBoughtPromises)
        ])

        setNumPlayerPurchased(playerData)
        setTeamScores(scores)
        setPlayersBought(boughtPlayers)

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
            {gameUnlocked ? (
              winner !== "0x0000000000000000000000000000000000000000" ? (
                <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full">
                  <Crown className="h-5 w-5" />
                  <span className="font-semibold">
                    Winner: {winner.slice(0, 6)}...{winner.slice(-4)} ({formatEther(winnerAmount)} ETH)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-500/10 text-gray-400 px-4 py-2 rounded-full">
                  <ClipboardCheck className="h-5 w-5" />
                  <span className="font-semibold">Game Complete - No Winner Determined</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-semibold">Winner Being Determined...</span>
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
            teamScores={teamScores}
            winner={winner}
            winnerAmount={winnerAmount}
            gameAddress={GameAddress}
            picAddress={picAddress}
            gameUnlocked={gameUnlocked}
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