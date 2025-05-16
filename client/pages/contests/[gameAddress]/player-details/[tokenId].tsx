import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAccount, useWatchContractEvent } from "wagmi";
import { writeContract, waitForTransactionReceipt, readContract, getPublicClient } from "@wagmi/core";
import { ContractContext } from "../../../../context/ContractContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, DollarSign, Users, ArrowUp, User } from "lucide-react";
import { config } from "@/config";
import GameABI from "../../../../constants/Game.json";
import AuctionABI from "../../../../constants/Auction.json";
import { formatEther } from "ethers";
import { cn } from "@/lib/utils";
import { Log } from 'viem'
import { 
  fetchPlayerDetails as getPlayerDetails, 
  getAuctionContract as fetchAuctionContract,
  fetchAuctionState,
  fetchCurrentBid,
  fetchPastBidEvents
} from "@/utils/contractUtils";

interface PageProps {
  gameAddress: string;
  tokenId: string;
}

interface BidEvent {
  bidder: string;
  amount: bigint;
  timestamp: number;
}

const getImageUrl = (ipfsUrl: string) => {
  if (!ipfsUrl) return "";
  
  // Handle IPFS URLs
  if (ipfsUrl.startsWith("ipfs://")) {
    // Try multiple IPFS gateways for better reliability
    const cid = ipfsUrl.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${cid}`;
  }
  
  return ipfsUrl;
};

const PlayerDetails: React.FC<PageProps> = ({ gameAddress, tokenId }) => {
  const [bids, setBids] = useState<BidEvent[]>([]);
  const [currentBid, setCurrentBid] = useState<bigint>(BigInt(0));
  const [playerDetails, setPlayerDetails] = useState({
    image: "",
    name: "",
    role: "",
  });
  const [auctionDuration, setAuctionDuration] = useState<number>(0);
  const [currentAuctionTime, setCurrentAuctionTime] = useState<number>(0);
  const [auctionState, setAuctionState] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [auctionContract, setAuctionContract] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000" as `0x${string}`);

  const { address } = useAccount();
  const router = useRouter();
  const context = useContext(ContractContext);

  if (!context) {
    throw new Error("ContractContext must be used within ContractProvider");
  }

  const {
    PICAddress,
    PICAddresssetup,
    fetchTokens,
    currentPlayer,
    fetchcurrentPlayer,
  } = context;

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentAuctionTime > 0 && auctionDuration > 0) {
        const now = Math.floor(Date.now() / 1000);
        const nextAuctionTime = currentAuctionTime + auctionDuration;
        const remaining = Math.max(0, nextAuctionTime - now);
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAuctionTime, auctionDuration]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, set up PIC address and wait for it
        await PICAddresssetup(gameAddress);

        // Make sure PICAddress is available before proceeding
        if (!PICAddress) {
          console.warn("PICAddress not available yet, retrying later");
          setLoading(false);
          return;
        }

        // Get auction contract address first
        const auctionContractAddress = await fetchAuctionContract(gameAddress);
        if (!auctionContractAddress || auctionContractAddress === "0x0000000000000000000000000000000000000000" as `0x${string}`) {
          console.error("Failed to get auction contract address");
          setError("Could not find auction contract. Please try again later.");
          setLoading(false);
          return;
        }
        setAuctionContract(auctionContractAddress as `0x${string}`);

        // Then fetch current player count
        await fetchcurrentPlayer(gameAddress);

        // Fetch tokens if address is available
        if (address) {
          await fetchTokens(gameAddress, address);
        }

        // Get auction times and state
        const [auctionTimeData, currentAuctionTimeData, auctionStateData] = await Promise.all([
          readContract(config, {
            address: gameAddress as `0x${string}`,
            abi: GameABI,
            functionName: "s_auctionTime",
          }),
          readContract(config, {
            address: gameAddress as `0x${string}`,
            abi: GameABI,
            functionName: "s_currentAuctionTime",
          }),
          fetchAuctionState(gameAddress),
        ]);

        setAuctionDuration(Number(auctionTimeData));
        setCurrentAuctionTime(Number(currentAuctionTimeData));
        setAuctionState(auctionStateData);

        // Then fetch player details
        const details = await getPlayerDetails(PICAddress, parseInt(tokenId));
        setPlayerDetails({
          image: details.imageURI,
          name: details.name,
          role: details.role,
        });

        // Now we can safely use auctionContract since it's properly initialized
        const currentBidAmount = await fetchCurrentBid(gameAddress);
        setCurrentBid(currentBidAmount);
        
        const pastBids = await fetchPastBidEvents(gameAddress, parseInt(tokenId));
        setBids(pastBids);

        // Calculate initial time remaining
        const now = Math.floor(Date.now() / 1000);
        const nextAuctionTime = Number(currentAuctionTimeData) + Number(auctionTimeData);
        setTimeRemaining(Math.max(0, nextAuctionTime - now));

      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load player details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameAddress, tokenId, address, PICAddress]);

  // Watch for bid events
  useWatchContractEvent({
    address: auctionContract,
    abi: AuctionABI,
    eventName: 'HighestBidIncrease',
    onLogs: async (logs: Log[]) => {
      const relevantLogs = logs.filter(log => {
        const args = (log as any).args;
        return args?.currentPlayer?.toString() === tokenId;
      });
      
      if (relevantLogs.length > 0) {
        // Refetch all past events to ensure we have the complete history
        const pastBids = await fetchPastBidEvents(gameAddress, parseInt(tokenId));
        setBids(pastBids);
        
        // Update current bid
        const currentBidAmount = await fetchCurrentBid(gameAddress);
        setCurrentBid(currentBidAmount);
        
        toast.success("New bid received!");
      }
    },
  });

  // Watch for auction end events
  useWatchContractEvent({
    address: auctionContract,
    abi: AuctionABI,
    eventName: 'AuctionEnded',
    onLogs: async (logs: Log[]) => {
      const relevantLogs = logs.filter(log => {
        const args = (log as any).args;
        return args?.currentPlayer?.toString() === tokenId;
      });
      
      if (relevantLogs.length > 0) {
        const args = (relevantLogs[0] as any).args;
        setCurrentBid(args.amount);
        setAuctionState(false);
        
        // Refetch bid history to ensure it's up to date
        const pastBids = await fetchPastBidEvents(gameAddress, parseInt(tokenId));
        setBids(pastBids);
        
        toast.success("Auction has ended!");
      }
    },
  });

  // Watch for auction start events
  useWatchContractEvent({
    address: auctionContract,
    abi: AuctionABI,
    eventName: 'AuctionStarted',
    onLogs: async (logs: Log[]) => {
      const relevantPlayer = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_currentPlayer",
      });
      
      if (relevantPlayer as String === tokenId) {
        setAuctionState(true);
        
        // Update current auction time
        const currentAuctionTimeData = await readContract(config, {
          address: gameAddress as `0x${string}`,
          abi: GameABI,
          functionName: "s_currentAuctionTime",
        });
        
        setCurrentAuctionTime(Number(currentAuctionTimeData));
        
        toast.success("Auction has started!");
      }
    },
  });

  const placeBid = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    toast.loading("Placing bid...", { id: "bidding" });
    try {
      const result = await writeContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "bid",
        args: [],
      });

      if (typeof result === 'string') {
        await waitForTransactionReceipt(config, { hash: result });
      }

      toast.success("Bid placed successfully", { id: "bidding" });

      // Refetch bid history and current bid
      const pastBids = await fetchPastBidEvents(gameAddress, parseInt(tokenId));
      setBids(pastBids);
      const currentBidAmount = await fetchCurrentBid(gameAddress);
      setCurrentBid(currentBidAmount);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to place bid", { id: "bidding" });
    }
  };

  const getPlayerStatus = () => {
    const playerId = parseInt(tokenId);
    if (playerId < currentPlayer) {
      return {
        status: 'AUCTIONED',
        label: 'Auctioned',
        color: 'bg-red-500/10 text-red-500'
      };
    } else if (playerId === currentPlayer) {
      return {
        status: 'CURRENT',
        label: 'Current Auction',
        color: 'bg-green-500/10 text-green-500'
      };
    } else {
      return {
        status: 'UPCOMING',
        label: 'Upcoming',
        color: 'bg-blue-500/10 text-blue-500'
      };
    }
  };

  const isAuctionActive = () => {
    const playerId = parseInt(tokenId);
    const status = getPlayerStatus();
    return status.status === 'CURRENT' && auctionState && timeRemaining > 0;
  };

  const formatTimeRemaining = () => {
    if (timeRemaining <= 0) {
      return "Auction Ended";
    }

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.reload()} className="bg-purple-500 hover:bg-purple-600">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden">
            {playerDetails.image && (
              <Image
                src={getImageUrl(playerDetails.image)}
                alt={playerDetails.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                unoptimized
                onError={(e) => {
                  console.error("Error loading image:", playerDetails.image);
                  (e.target as HTMLImageElement).src = "/assets/placeholder.png";
                }}
              />
            )}
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                  {playerDetails.name.toUpperCase()}
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge className={cn(
                    "px-3 py-1 text-sm",
                    isAuctionActive()
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  )}>
                    {isAuctionActive() ? "AUCTION ACTIVE" : getPlayerStatus().label.toUpperCase()}
                  </Badge>
                  {isAuctionActive() && (
                    <Badge className="px-3 py-1 text-sm bg-purple-500/10 text-purple-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeRemaining()}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-400 mb-4">{playerDetails.role}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center p-4">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Current Bid</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold text-white">
                          {Number(currentBid)}
                        </p>
                        <Image
                          src="/assets/currency.png"
                          alt="currency"
                          width={24}
                          height={24}
                          className="w-6 h-6"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center p-4">
                    <Users className="w-5 h-5 mr-2 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Total Bids</p>
                      <p className="text-lg font-semibold text-white">{bids.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-gray-800 border-gray-700 mb-4">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold text-white mb-3">Bid History</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bids.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">
                      No bids placed yet
                    </div>
                  ) : (
                    <AnimatePresence>
                      {bids.map((bid, index) => (
                        <motion.div
                          key={`${bid.bidder}-${bid.timestamp}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-700 rounded-full p-1.5">
                              <User className="h-4 w-4 text-gray-300" />
                            </div>
                            <div className="text-sm">
                              <p className="text-gray-300 font-medium">
                                {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Block #{bid.timestamp}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-white font-medium mr-2">
                              {Number(bid.amount)} tokens
                            </span>
                            {index === 0 && (
                              <Badge className="bg-green-500/10 text-green-500 ml-1">
                                <ArrowUp className="w-3 h-3 mr-1" />
                                Highest
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={placeBid}
              disabled={!isAuctionActive() || !address || timeRemaining <= 0}
              className={cn(
                "w-full py-5 text-lg font-semibold",
                isAuctionActive() && timeRemaining > 0
                  ? "bg-purple-500 hover:bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              )}
            >
              {!address
                ? "Connect Wallet to Bid"
                : !isAuctionActive()
                  ? getPlayerStatus().label
                  : timeRemaining <= 0
                    ? "Time's Up"
                    : `Place Bid (${Number(currentBid)})`}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerDetails;

export async function getServerSideProps(context: {
  params: { gameAddress: string; tokenId: string };
}) {
  const { gameAddress, tokenId } = context.params;
  return {
    props: {
      gameAddress,
      tokenId,
    },
  };
}