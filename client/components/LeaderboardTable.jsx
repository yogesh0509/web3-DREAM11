'use client'

import React, { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount } from 'wagmi'
import { toast } from "react-hot-toast"
import { ChevronDown, ChevronUp, Trophy, Coins, Users, Award, Loader2 } from 'lucide-react'
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
import { ContractContext } from "@/context/ContractContext"
import { formatEther } from "ethers"
import { cn } from "@/lib/utils"

function LeaderboardRow({ 
  registrant, 
  numPurchased, 
  isWinner, 
  winnerAmount, 
  gameAddress,
  rank 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const { address } = useAccount()
  const context = useContext(ContractContext)

  const handleWithdraw = async () => {
    if (address !== registrant) {
      toast.error("Not authorized to withdraw")
      return
    }

    try {
      setLoading(true)
      toast.loading("Processing withdrawal...", { id: "withdraw" })
      await context.withdrawDreamToken(gameAddress)
      toast.success("Withdrawal successful", { id: "withdraw" })
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast.error("Failed to process withdrawal", { id: "withdraw" })
    } finally {
      setLoading(false)
    }
  }

  const handleWinnerClaim = async () => {
    if (address !== registrant) {
      toast.error("Not authorized to claim")
      return
    }

    try {
      setLoading(true)
      toast.loading("Processing claim...", { id: "claim" })
      await context.withdrawWinnerFunds(gameAddress)
      toast.success("Claim successful", { id: "claim" })
    } catch (error) {
      console.error("Claim error:", error)
      toast.error("Failed to process claim", { id: "claim" })
    } finally {
      setLoading(false)
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
        className="group hover:bg-gray-700/50 transition-colors"
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
                <p className="font-medium text-white">
                  {registrant.slice(0, 6)}...{registrant.slice(-4)}
                </p>
                {getRankBadge(rank)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
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
                disabled={loading}
                className={cn(
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trophy className="h-4 w-4 mr-2" />
                )}
                Claim {formatEther(winnerAmount)} ETH
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
            <TableCell colSpan={3} className="bg-gray-800/50">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-white">Player Details</h4>
                  {!isWinner && (
                    <Button
                      variant="outline"
                      onClick={handleWithdraw}
                      disabled={loading}
                      className={cn(
                        "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
                        loading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Coins className="h-4 w-4 mr-2" />
                      )}
                      Withdraw Tokens
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array(numPurchased).fill(0).map((_, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${registrant}-${index}.png`} />
                          <AvatarFallback>{index + 1}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">Player #{index + 1}</p>
                          <p className="text-xs text-gray-400">Selected</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
  winner,
  winnerAmount,
  gameAddress
}) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 text-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
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