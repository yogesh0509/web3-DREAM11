'use client'

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount } from 'wagmi'
import { writeContract } from '@wagmi/core'
import { toast } from "react-hot-toast"
import { ChevronDown, ChevronUp, Trophy, Coins, Users, Award } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const abi = require("@/constants/abi.json")

function LeaderboardRow({ 
  registrant, 
  numPurchased, 
  playersBought, 
  isWinner, 
  winnerAmount, 
  gameAddress,
  rank 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { address } = useAccount()
  const GamecontractABI = JSON.parse(abi["Game"])

  const handleWithdraw = async () => {
    if (address !== registrant) {
      toast.error("Not authorized to withdraw")
      return
    }

    try {
      toast.loading("Processing withdrawal...", { id: "withdraw" })
      const { hash } = await writeContract({
        address: gameAddress,
        abi: GamecontractABI,
        functionName: "withdrawDreamToken",
      })
      
      await waitForTransaction({ hash })
      toast.success("Withdrawal successful", { id: "withdraw" })
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast.error("Failed to process withdrawal", { id: "withdraw" })
    }
  }

  const handleWinnerClaim = async () => {
    if (address !== registrant) {
      toast.error("Not authorized to claim")
      return
    }

    try {
      toast.loading("Processing claim...", { id: "claim" })
      const { hash } = await writeContract({
        address: gameAddress,
        abi: GamecontractABI,
        functionName: "withdrawDreamToken",
      })
      
      await waitForTransaction({ hash })
      toast.success("Claim successful", { id: "claim" })
    } catch (error) {
      console.error("Claim error:", error)
      toast.error("Failed to process claim", { id: "claim" })
    }
  }

  const getRankBadge = (rank) => {
    switch(rank) {
      case 1:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
          <Trophy className="w-3 h-3 mr-1" />
          1st
        </Badge>;
      case 2:
        return <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/20">
          <Award className="w-3 h-3 mr-1" />
          2nd
        </Badge>;
      case 3:
        return <Badge className="bg-amber-600/20 text-amber-600 border-amber-600/20">
          <Award className="w-3 h-3 mr-1" />
          3rd
        </Badge>;
      default:
        return <Badge variant="outline">{rank}th</Badge>;
    }
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="group hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <TableCell className="w-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${registrant}.png`} />
              <AvatarFallback>
                {registrant.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {registrant.slice(0, 6)}...{registrant.slice(-4)}
                </p>
                {getRankBadge(rank)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{numPurchased} Players Selected</span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">
          {isWinner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Button
                variant="outline"
                onClick={handleWinnerClaim}
                className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Claim {winnerAmount} ETH
              </Button>
            </motion.div>
          )}
        </TableCell>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TableCell colSpan={3} className="bg-gray-50 dark:bg-gray-800/50">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Selected Players</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {playersBought.map((player, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${player}.png`} />
                          <AvatarFallback>{player.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{player}</p>
                          <p className="text-xs text-gray-500">Player #{index + 1}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!isWinner && (
                  <Button
                    variant="outline"
                    onClick={handleWithdraw}
                    className="mt-4"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Withdraw Tokens
                  </Button>
                )}
              </motion.div>
            </TableCell>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default function LeaderboardTable({
  registrants,
  numPlayerPurchased,
  playersBought,
  winner,
  winnerAmount,
  gameAddress
}) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrants.map((registrant, index) => (
            <LeaderboardRow
              key={registrant}
              registrant={registrant}
              numPurchased={numPlayerPurchased[index]}
              playersBought={playersBought[index]}
              isWinner={winner === registrant}
              winnerAmount={winnerAmount}
              gameAddress={gameAddress}
              rank={index + 1}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}