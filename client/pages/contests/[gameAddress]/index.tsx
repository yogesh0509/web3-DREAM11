import React, { useEffect, useState, useContext } from "react"
import { useRouter } from 'next/router'
import { useAccount, useWatchContractEvent } from "wagmi"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Search, Clock } from "lucide-react"
import { ContractContext } from "../../../context/ContractContext"
import { PlayerCard } from "../../../components/Card/PlayerCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import GameABI from "../../../constants/Game.json"
import { fetchPlayerDetails, fetchTotalPlayers } from "@/utils/contractUtils"
import { toast } from "react-hot-toast"

interface Player {
  imageURI: string
  name: string
  role: string
  id: number
}

interface PageProps {
  gameAddress: string
}

export default function ContestsPage({ gameAddress }: PageProps) {
  const { address } = useAccount()
  const [account, setAccount] = useState<string | undefined>(address)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [gameState, setGameState] = useState({
    auctionState: false,
    auctionTime: 0,
    currentTime: Date.now(),
  })
  const router = useRouter()
  
  const contractContext = useContext(ContractContext)
  if (!contractContext) {
    throw new Error("ContractContext is not available")
  }

  const { 
    PICAddress, 
    PICAddresssetup, 
    fetchTokens, 
    currentPlayer, 
    fetchcurrentPlayer,
  } = contractContext

  const loadPlayers = async () => {
    try {
      setLoading(true)
      
      // Set up PIC address first
      await PICAddresssetup(gameAddress)
      await fetchcurrentPlayer(gameAddress)
      if (address) {
        await fetchTokens(gameAddress, address)
      }
      
      // Make sure PICAddress is available before proceeding
      if (!PICAddress) {
        console.warn("PICAddress not available yet, retrying later");
        setLoading(false);
        return;
      }
      
      let totalPlayers;
      try {
        totalPlayers = await fetchTotalPlayers(PICAddress);
      } catch (error) {
        console.error("Error fetching total players:", error);
        totalPlayers = 0;
      }
      
      const playersArray = [];
      // Start from index 0 instead of 1, as the contract indexes players from 0
      for (let i = 0; i < totalPlayers && i < 100; i++) { // Add upper limit to prevent too many requests
        try {
          const playerData = await fetchPlayerDetails(PICAddress, i);
          if (playerData && playerData.name) { // Verify we have valid data
            playersArray.push({
              ...playerData,
              id: i // Ensure ID is set correctly
            });
          }
        } catch (error) {
          console.error(`Error fetching player ${i}:`, error);
          // Don't add invalid players to the array
        }
      }
      
      setPlayers(playersArray);
    } catch (error) {
      console.error("Error loading players:", error);
      toast.error("Failed to load players. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers()
  }, [PICAddress, gameAddress, address])

  useEffect(() => {
    if (account !== address) {
      router.push("/")
    }
  }, [address])

  useWatchContractEvent({
    address: gameAddress as `0x${string}`,
    abi: GameABI,
    eventName: "AuctionStarted",
    onLogs: () => {
      localStorage.setItem("time", Date.now().toString())
      localStorage.setItem("state", "false")
      setGameState((prev) => ({ ...prev, auctionState: false }))
    },
  })

  useWatchContractEvent({
    address: gameAddress as `0x${string}`,
    abi: GameABI,
    eventName: "AuctionEnded",
    onLogs: () => {
      localStorage.setItem("time", Date.now().toString())
      localStorage.setItem("state", "true")
      setGameState((prev) => ({ ...prev, auctionState: true }))
    },
  })

  const filteredPlayers = players.filter(player => 
    player && player.name && player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlayerStatus = (player: Player) => {
    if (player.id < currentPlayer) {
      return {
        status: 'SOLD' as const,
        label: 'Sold',
        color: 'bg-red-500/10 text-red-500'
      };
    } else if (player.id === currentPlayer) {
      return {
        status: 'CURRENT' as const,
        label: 'Current Auction',
        color: 'bg-green-500/10 text-green-500'
      };
    } else {
      return {
        status: 'UPCOMING' as const,
        label: 'Upcoming',
        color: 'bg-blue-500/10 text-blue-500'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Player Auction
                  </h2>
                </div>
                <div className="w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search players..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
          ) : filteredPlayers.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredPlayers.map((player) => {
                const status = getPlayerStatus(player);
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (player.id % 10) }} // Use modulo to limit delay
                  >
                    <PlayerCard
                      image={player.imageURI}
                      id={player.id}
                      role={player.role}
                      name={player.name}
                      currentPlayer={currentPlayer}
                      status={status}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <h3 className="text-xl text-gray-400 mb-4">No players found</h3>
              <Button 
                onClick={loadPlayers}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Refresh Players
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export async function getServerSideProps(context: { params: { gameAddress: string } }) {
  const { gameAddress } = context.params
  return {
    props: {
      gameAddress
    },
  }
}

