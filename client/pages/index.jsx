import React, { useState, useEffect } from "react";
import { readContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GamepadIcon, User, Menu, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import ContestCard from "../components/Card/ContestCard";
import { config } from "../config";
const abi = require("../constants/abi.json");

export default function Index() {
  const runningTimes = [
    { label: "GAME", value: "57", color: "from-violet-500 to-purple-600" },
    { label: "GAMES", value: "33", color: "from-pink-500 to-rose-600" },
    { label: "PROFILE", value: "37", color: "from-blue-500 to-cyan-600" },
  ];

  const { address } = useAccount();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const contractABI = JSON.parse(abi["GameFactory"]);
  const Contractaddress = process.env.NEXT_PUBLIC_GAME_FACTORY_CONTRACT_ADDRESS;

  useEffect(() => {
    if (address) {
      fetchContests();
    }
  }, [address]);

  async function fetchContests() {
    try {
      setLoading(true);
      const data = await readContract(config, {
        address: Contractaddress,
        abi: contractABI,
        functionName: "getAllGames",
      });
      const res = data.map(a => a.GameAddress);
      setGames(res);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-900 pt-16 md:pt-20">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed left-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-64 bg-gray-800 p-6 text-gray-100 border-r border-gray-700 overflow-y-auto"
      >
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">New to Blockchain</h1>
        <p className="text-sm mb-6 text-gray-400">Test your knowledge & earn real money</p>
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white mb-8 transition-all duration-300 hover:scale-105"
        >
          JOIN NOW
        </Button>
        <div className="grid grid-cols-2 gap-2">
          {[
            "bg-purple-500",
            "bg-pink-500",
            "bg-blue-500",
            "bg-green-500"
          ].map((color, i) => (
            <motion.div
              key={i}
              className={`aspect-square border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-gray-600 transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-3 h-3 ${color} rounded-full`}></div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6 overflow-x-hidden">
        {/* Running Times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 text-gray-100">RUNNING TIME:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {runningTimes.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${item.color} text-transparent bg-clip-text`}>
                      {item.value}
                    </div>
                    <div className="text-sm text-gray-400">{item.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
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
                className="bg-purple-600 hover:bg-purple-700 transition-colors duration-300"
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