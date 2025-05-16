import React, { useEffect, useState } from "react";
import { useAccount } from 'wagmi';
import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from 'next/router';
import Countdown from 'react-countdown';
import { parseEther, formatEther } from 'ethers';
import { motion } from "framer-motion";
import { Clock, Trophy, Coins, Users, AlertCircle, Wallet } from "lucide-react";
import contractABI from "../../constants/Game.json";
import { config } from "../../config";

interface GameData {
  startTime: number;
  endTime: number;
  totalPlayers: number;
  currentPlayers: number;
  prizePool: string;
  entryFee: string;
  isRegistered: boolean;
  auctionState: boolean;
  currentAuctionTime: number;
  auctionDuration: number;
  gameState: 'REGISTRATION' | 'AUCTION_ACTIVE' | 'BETWEEN_AUCTIONS' | 'GAME_COMPLETE';
  currentPlayerId: number;
  totalBuyers: number;
  auctionablePlayers: number;
}

const CountdownRenderer = ({ days, hours, minutes, seconds, completed }: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}) => {
  if (completed) {
    return <span className="text-red-400">Expired</span>;
  }
  
  return (
    <div className="flex gap-2 items-center">
      {days > 0 && <span>{days}d</span>}
      <span>{String(hours).padStart(2, '0')}h</span>
      <span>{String(minutes).padStart(2, '0')}m</span>
      <span>{String(seconds).padStart(2, '0')}s</span>
    </div>
  );
};

interface ContestCardProps {
  Game: string;
}

export default function ContestCard({ Game }: ContestCardProps) {
  const [gameData, setGameData] = useState<GameData>({
    startTime: 0,
    endTime: 0,
    totalPlayers: 0,
    currentPlayers: 0,
    prizePool: "0",
    entryFee: "0",
    isRegistered: false,
    auctionState: false,
    currentAuctionTime: 0,
    auctionDuration: 0,
    gameState: 'REGISTRATION',
    currentPlayerId: 0,
    totalBuyers: 0,
    auctionablePlayers: 0
  });
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();
  const router = useRouter();
  const [registrationFee, setRegistrationFee] = useState<string>("0");
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    if (Game) {
      fetchGameData();
      // Update every 30 seconds instead of every second
      const interval = setInterval(() => {
        const now = Date.now();
        if (now - lastUpdate >= 30000) { // Only update if 30 seconds have passed
          fetchGameData();
          setLastUpdate(now);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [Game, address, lastUpdate]);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      const [
        auctionTime,
        currentAuctionTime,
        totalPlayers,
        currentPlayers,
        auctionState,
        isRegistered,
        registrationFeeRaw,
        unlock,
        buyers,
        totalAuctionablePlayers
      ] = await Promise.all([
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "s_auctionTime",
        }),
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "s_currentAuctionTime",
        }),
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "s_totalplayerCount",
        }),
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "s_currentplayercount",
        }),
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "s_auctionState",
        }),
        address ? readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "s_buyercheck",
          args: [address],
        }) : Promise.resolve(false),
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "REGISTRATION_FEE",
        }),
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "s_unlock",
        }),
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "getBuyers",
        }),
        readContract(config, {
          address: Game as `0x${string}`,
          abi: contractABI,
          functionName: "s_totalplayerCount",
        })
      ]);

      const auctionDuration = Number(auctionTime);
      const currentAuctionTimeNum = Number(currentAuctionTime);
      const currentPlayersNum = Number(currentPlayers);
      const totalPlayersNum = Number(totalPlayers);
      const isAuctionState = Boolean(auctionState);
      const isUnlocked = Boolean(unlock);
      const totalBuyers = (buyers as string[]).length;
      const registrationFeeEth = formatEther(registrationFeeRaw as bigint);
      
      // Calculate prize pool (70% of total registration fees)
      const totalRegistrationFees = parseEther(registrationFeeEth) * BigInt(totalBuyers);
      const prizePool = (totalRegistrationFees * BigInt(70)) / BigInt(100);

      // Calculate game state
      let gameState: GameData['gameState'];
      if (isUnlocked) {
        gameState = 'GAME_COMPLETE';
      } else if (isAuctionState) {
        gameState = 'AUCTION_ACTIVE';
      } else if (currentPlayersNum < totalPlayersNum) {
        gameState = 'BETWEEN_AUCTIONS';
      } else {
        gameState = 'REGISTRATION';
      }

      // Calculate next auction time
      const nextAuctionTime = currentAuctionTimeNum + auctionDuration;
      setRegistrationFee(registrationFeeEth);

      setGameData(prev => {
        // Only update if there are actual changes
        if (
          prev.startTime === currentAuctionTimeNum * 1000 &&
          prev.endTime === nextAuctionTime * 1000 &&
          prev.totalPlayers === totalPlayersNum &&
          prev.currentPlayers === currentPlayersNum &&
          prev.prizePool === formatEther(prizePool) &&
          prev.isRegistered === Boolean(isRegistered) &&
          prev.auctionState === isAuctionState &&
          prev.gameState === gameState &&
          prev.currentPlayerId === currentPlayersNum &&
          prev.totalBuyers === totalBuyers &&
          prev.auctionablePlayers === Number(totalAuctionablePlayers)
        ) {
          return prev;
        }
        return {
          startTime: currentAuctionTimeNum * 1000,
          endTime: nextAuctionTime * 1000,
          totalPlayers: totalPlayersNum,
          currentPlayers: currentPlayersNum,
          prizePool: formatEther(prizePool),
          entryFee: registrationFeeEth,
          isRegistered: Boolean(isRegistered),
          auctionState: isAuctionState,
          currentAuctionTime: currentAuctionTimeNum,
          auctionDuration: auctionDuration,
          gameState,
          currentPlayerId: currentPlayersNum,
          totalBuyers: totalBuyers,
          auctionablePlayers: Number(totalAuctionablePlayers)
        };
      });
    } catch (error) {
      console.error("Error fetching game data:", error);
      toast.error("Failed to fetch game data");
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      toast.loading("Registering for the game...");
      const result = await writeContract(config, {
        address: Game as `0x${string}`,
        abi: contractABI,
        functionName: "register",
        value: parseEther(registrationFee),
      });

      if (typeof result === 'string') {
        await waitForTransactionReceipt(config, { hash: result });
      }
      toast.success("Successfully registered!");
      fetchGameData();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register for the game");
    }
  };

  const enter = () => {
    router.push(`/contests/${Game}`);
  };

  const getGameStateMessage = () => {
    switch (gameData.gameState) {
      case 'REGISTRATION':
        return "Registration Open - Join Now!";
      case 'AUCTION_ACTIVE':
        return `Auction Active - Player ${gameData.currentPlayerId + 1} of ${gameData.totalPlayers}`;
      case 'BETWEEN_AUCTIONS':
        return `Waiting for Next Auction - Player ${gameData.currentPlayerId + 1} of ${gameData.totalPlayers}`;
      case 'GAME_COMPLETE':
        return "Game Complete - Results Pending";
      default:
        return "";
    }
  };

  const getTimeMessage = () => {
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = gameData.endTime / 1000 - now;

    if (gameData.gameState === 'GAME_COMPLETE') {
      return "Game has ended";
    }

    if (timeRemaining <= 0) {
      return "Time's up!";
    }

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    return `${hours}h ${minutes}m ${seconds}s remaining`;
  };

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700/50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-gray-800 border-gray-700 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-0 relative aspect-[3/4]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-600/90 opacity-75 group-hover:opacity-90 transition-opacity duration-300"></div>
          <img
            src="/assets/contest.png"
            alt="Contest Image"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            {/* Top Section */}
            <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold">Prize Pool</span>
                </div>
                <span className="text-white font-bold">{gameData.prizePool} ETH</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-400" />
                <span className="text-white font-bold">Entry Fee:</span>
                <span className="text-white">{gameData.entryFee} ETH</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold">Players:</span>
                <span className="text-white">{gameData.currentPlayers}/{gameData.totalPlayers}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Wallet className="w-5 h-5 text-gray-400" />
                <span className="text-white font-bold">Game:</span>
                <span className="text-white text-xs truncate">{Game}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold">Registered Participants:</span>
                <span className="text-white">{gameData.totalBuyers}</span>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="space-y-4 bg-black/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Current Status:</span>
                  </div>
                  <span className="text-white font-medium">{getGameStateMessage()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Time Remaining:</span>
                  </div>
                  <span className="text-white font-medium">{getTimeMessage()}</span>
                </div>
                {gameData.gameState === 'AUCTION_ACTIVE' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Current Player:</span>
                    </div>
                    <span className="text-white font-medium">Player {gameData.currentPlayerId + 1}</span>
                  </div>
                )}
              </div>

              {gameData.isRegistered ? (
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transform transition-all duration-200 hover:scale-[1.02]"
                  onClick={enter}
                >
                  {gameData.gameState === 'GAME_COMPLETE' ? 'View Results' : 'Enter Contest'}
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transform transition-all duration-200 hover:scale-[1.02]"
                  onClick={register}
                  disabled={gameData.auctionState || gameData.gameState === 'GAME_COMPLETE'}
                >
                  {gameData.auctionState ? "Auction in Progress" : 
                   gameData.gameState === 'GAME_COMPLETE' ? "Game Complete" : 
                   "Register Now"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 