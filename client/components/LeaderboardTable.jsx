'use client'

import React, { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount } from 'wagmi'
import { toast } from "react-hot-toast"
import { ChevronDown, ChevronUp, Trophy, Coins, Users, Award, Loader2, Star, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
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
import { withdrawDreamToken, withdrawWinnerFunds } from "@/utils/contractUtils"

function PlayerCard({ player, gameAddress, picAddress }) {
  return (
    <Link href={`/contests/${gameAddress}/player-details/${player.tokenId}`} passHref>
      <div className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 border-2 border-purple-500/30">
            <AvatarImage 
              src={player.player.imageURI || `https://avatar.vercel.sh/${player.tokenId}.png`} 
              alt={player.player.name}
            />
            <AvatarFallback>{player.player.name?.charAt(0) || "P"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white truncate">
                {player.player.name || `Player #${player.tokenId}`}
              </p>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                {player.price.toString()} Tokens
              </Badge>
            </div>
            <p className="text-xs text-gray-400">{player.player.role || "Unknown Role"}</p>
            <div className="flex items-center gap-1 mt-1">
              <ExternalLink className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400">View Details</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LeaderboardRow({ 
  registrant, 
  numPurchased, 
  teamScore,
  playersList,
  isWinner, 
  winnerAmount, 
  gameAddress,
  picAddress,
  gameUnlocked,
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
      await withdrawDreamToken(gameAddress)
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
      await withdrawWinnerFunds(gameAddress)
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
              {/* <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Star className="w-4 h-4" />
                <span>Team Score: {teamScore?.toString() || '0'}</span>
              </div> */}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">
          {isWinner && gameUnlocked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Button
                variant="outline"
                onClick={handleWinnerClaim}
                disabled={loading || winnerAmount === BigInt(0)}
                className={cn(
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20",
                  loading && "opacity-50 cursor-not-allowed",
                  winnerAmount === BigInt(0) && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trophy className="h-4 w-4 mr-2" />
                )}
                {winnerAmount === BigInt(0) ? "Already Claimed" : `Claim ${formatEther(winnerAmount)} ETH`}
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
                
                {playersList && playersList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {playersList.map((player, index) => (
                      <PlayerCard 
                        key={`${registrant}-${player.tokenId}`} 
                        player={player} 
                        gameAddress={gameAddress}
                        picAddress={picAddress}
                      />
                    ))}
                  </div>
                ) : numPurchased > 0 ? (
                  <div className="p-3 bg-gray-700/30 rounded-lg text-center">
                    <p className="text-gray-400">Player data is loading...</p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-700/30 rounded-lg text-center">
                    <p className="text-gray-400">No players purchased yet</p>
                  </div>
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
  teamScores,
  winner,
  winnerAmount,
  gameAddress,
  picAddress,
  gameUnlocked
}) {
  // Sort registrants by team score in descending order if we have scores
  const sortedData = registrants.map((registrant, index) => ({
    registrant,
    numPurchased: numPlayerPurchased[index] || 0,
    teamScore: teamScores[index] || BigInt(0),
    playersList: playersBought[index] || []
  })).sort((a, b) => {
    // First sort by team score (higher first)
    if (b.teamScore > a.teamScore) return 1;
    if (b.teamScore < a.teamScore) return -1;
    
    // If team scores are equal, sort by number of players purchased (higher first)
    return b.numPurchased - a.numPurchased;
  });

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
          {sortedData.map((item, index) => (
            <LeaderboardRow
              key={item.registrant}
              registrant={item.registrant}
              numPurchased={item.numPurchased}
              teamScore={item.teamScore}
              playersList={item.playersList}
              isWinner={winner === item.registrant}
              winnerAmount={winnerAmount}
              gameAddress={gameAddress}
              picAddress={picAddress}
              gameUnlocked={gameUnlocked}
              rank={index + 1}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}