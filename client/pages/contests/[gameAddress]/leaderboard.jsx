import React, { useEffect, useState, useContext } from "react"
import { useRouter } from 'next/router'
import { readContract } from "@wagmi/core"
import { useAccount } from "wagmi"
import { motion } from "framer-motion"
import { ContractContext } from "../../../context/ContractContext"
import { StatCard } from "@/components/ui/stat-card"
import { RankColumn } from "@/components/ui/rank-column"
import { FloatingOrbs } from "@/components/decorative/floating-orbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from 'lucide-react'

const abi = require("../../../constants/abi.json")

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

  useEffect(() => {

    const initializeData = async () => {
      try {
        setLoading(true)
        await fetchLeaderboard()
        await fetchTokens(GameAddress, address)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [address, GameAddress])

  const fetchLeaderboard = async () => {
    try {
      const buyersData = await readContract({
        address: GameAddress,
        abi: GamecontractABI,
        functionName: "getBuyers",
      })
      setRegistrants(buyersData)

      const playerDataPromises = buyersData.map(async (player) => {
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
          }),
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

      const winnerFunds = await readContract({
        address: GameAddress,
        abi: GamecontractABI,
        functionName: "s_winnerFunds",
        args: [winnerAddress],
      })
      setWinnerAmount(parseInt(winnerFunds))
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        <FloatingOrbs />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-navy-900 mb-4">
            Leaderboard Page
          </h1>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search players..."
                className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* Ranking Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          <RankColumn
            title="Rank"
            values={registrants.map((_, i) => `#${i + 1}`)}
            color="bg-gradient-to-b from-blue-100/80 to-blue-200/80"
            delay={0.1}
          />
          <RankColumn
            title="Total Wins"
            values={numPlayerPurchased.map(count => count.toString())}
            color="bg-gradient-to-b from-yellow-100/80 to-yellow-200/80"
            delay={0.2}
          />
          <RankColumn
            title="Players Owned"
            values={playersBought.map(players => players.length.toString())}
            color="bg-gradient-to-b from-pink-100/80 to-pink-200/80"
            delay={0.3}
          />
          <RankColumn
            title="Earnings"
            values={registrants.map(() => "0.00")}
            color="bg-gradient-to-b from-purple-100/80 to-purple-200/80"
            delay={0.4}
          />
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <StatCard
              icon="/placeholder.svg"
              label="Rank"
              value="1.11"
              subValue="125 Wins"
              color="text-blue-600"
            />
            <StatCard
              icon="/placeholder.svg"
              label="Total Wins"
              value="1.20"
              subValue="125 Wins"
              color="text-yellow-600"
            />
            <StatCard
              icon="/placeholder.svg"
              label="Total Wins"
              value="1.20"
              subValue="125 Wins"
              color="text-pink-600"
            />
            <StatCard
              icon="/placeholder.svg"
              label="Earnings"
              value="1.29"
              subValue="125 Wins"
              color="text-purple-600"
            />
            <StatCard
              icon="/placeholder.svg"
              label="Earnings"
              value="1.32"
              subValue="125 Wins"
              color="text-green-600"
            />
          </div>
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
    }
  }
}

