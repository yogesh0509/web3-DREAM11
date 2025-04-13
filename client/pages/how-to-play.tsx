import React from 'react';
import { motion } from 'framer-motion';
import { GamepadIcon, Wallet, Coins, Trophy, Users, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Wallet,
    title: "Set Up Your Wallet",
    description: "Install MetaMask and create your wallet to start playing. Make sure to secure your private keys and backup your wallet."
  },
  {
    icon: Coins,
    title: "Get Some MATIC",
    description: "You'll need MATIC tokens to participate in auctions. You can buy MATIC on exchanges or get test tokens for practice."
  },
  {
    icon: GamepadIcon,
    title: "Join a Contest",
    description: "Browse available contests and register for one that interests you. Pay the entry fee to join the game."
  },
  {
    icon: Clock,
    title: "Participate in Auctions",
    description: "When a player's auction starts, place your bids. Each auction has a fixed duration and minimum bid increment."
  },
  {
    icon: Users,
    title: "Build Your Team",
    description: "Win auctions to add players to your team. Strategize to create the best possible team within your budget."
  },
  {
    icon: Trophy,
    title: "Win Rewards",
    description: "If your team performs well, you can win a share of the prize pool. The better your team performs, the more you earn!"
  }
];

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-4">
            How to Play
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Learn how to participate in our blockchain fantasy sports platform and start earning rewards today!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-purple-500/10 rounded-lg">
                        <Icon className="w-6 h-6 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    </div>
                    <p className="text-gray-400">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 