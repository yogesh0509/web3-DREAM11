import React, { useState, useEffect } from "react";
import { readContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GamepadIcon, Trophy, Users, Coins, Loader2, RefreshCw, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import ContestCard from "../components/Card/ContestCard.tsx";
import { config } from "../config";
import contractABI from "../constants/GameFactory.json";
import { formatEther } from "ethers";
import Link from 'next/link';

export default function Index() {
  const { address } = useAccount();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeGames: 0,
    totalPlayers: 0,
    totalPrizes: BigInt(0)
  });

  const Contractaddress = process.env.NEXT_PUBLIC_GAME_FACTORY_CONTRACT_ADDRESS;

  useEffect(() => {
    fetchContests();
  }, []);

  async function fetchContests() {
    try {
      setLoading(true);
      const gameAddresses = await readContract(config, {
        address: Contractaddress,
        abi: contractABI,
        functionName: "getAllGames",
      });
      setGames(gameAddresses);

      // Fetch stats for each game
      let totalPlayers = 0;
      let totalPrizes = BigInt(0);

      await Promise.all(gameAddresses.map(async (gameAddress) => {
        try {
          const [currentPlayers, prizePool] = await Promise.all([
            readContract(config, {
              address: gameAddress,
              abi: GameABI,
              functionName: "s_currentplayercount",
            }),
            readContract(config, {
              address: gameAddress,
              abi: GameABI,
              functionName: "s_TreasuryFunds",
            }),
          ]);

          totalPlayers += Number(currentPlayers);
          totalPrizes += BigInt(prizePool.toString());
        } catch (error) {
          console.error(`Error fetching stats for game ${gameAddress}:`, error);
        }
      }));

      setStats({
        activeGames: gameAddresses.length,
        totalPlayers,
        totalPrizes
      });
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  }

  const statsData = [
    { 
      label: "ACTIVE GAMES", 
      value: stats.activeGames.toString(), 
      icon: GamepadIcon, 
      color: "from-violet-500 to-purple-600" 
    },
    { 
      label: "TOTAL PLAYERS", 
      value: stats.totalPlayers.toString(), 
      icon: Users, 
      color: "from-pink-500 to-rose-600" 
    },
    { 
      label: "TOTAL PRIZES", 
      value: `${formatEther(stats.totalPrizes)} ETH`, 
      icon: Trophy, 
      color: "from-blue-500 to-cyan-600" 
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-16 md:pt-20">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed left-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-64 bg-gray-800/50 backdrop-blur-sm p-6 text-gray-100 border-r border-gray-700/50 overflow-y-auto"
      >
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Blockchain Fantasy Sports</h1>
        <p className="text-sm mb-6 text-gray-400">Play, compete, and earn crypto rewards</p>
        
          <div className="mb-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="w-5 h-5 text-purple-500" />
              <h3 className="font-medium text-white">New to Crypto?</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">Create your wallet to start playing and earning rewards</p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600 transition-colors"
            >
              Install MetaMask
            </a>
          </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <Coins className="w-5 h-5" />
            <span>Earn Crypto Rewards</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Trophy className="w-5 h-5" />
            <span>Compete Globally</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <GamepadIcon className="w-5 h-5" />
            <span>Real Time Auction</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6 overflow-x-hidden">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 text-gray-100">PLATFORM STATS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statsData.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className={`text-4xl font-bold bg-gradient-to-r ${item.color} text-transparent bg-clip-text`}>
                          {item.value}
                        </div>
                        <Icon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-400 mt-2">{item.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Games Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </motion.div>
          ) : games.length > 0 ? (
            <motion.div 
              key="games"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              {games.map((game, id) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: id * 0.1 }}
                >
                  <ContestCard Game={game} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-games"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <h3 className="text-xl text-gray-400 mb-4">No games available</h3>
              <Button 
                onClick={fetchContests}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-colors duration-300"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Games
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}