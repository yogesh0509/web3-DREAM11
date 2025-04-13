import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAccount, useWatchContractEvent } from "wagmi";
import { writeContract, waitForTransactionReceipt, readContract } from "@wagmi/core";
import { ContractContext } from "../../../../context/ContractContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, DollarSign, Users, ArrowUp, ArrowDown } from "lucide-react";
import { config } from "@/config";
import GameABI from "../../../../constants/Game.json";
import { formatEther } from "ethers";
import { cn } from "@/lib/utils";

interface PageProps {
  gameAddress: string;
  tokenId: string;
}

interface BidEvent {
  bidder: string;
  amount: bigint;
  timestamp: number;
}

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
    fetchPlayerDetails,
    fetchPlayerBids,
    fetchCurrentBid,
    fetchAuctionState,
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
        
        // Then fetch current player count
        await fetchcurrentPlayer(gameAddress);
        
        // Fetch tokens if address is available
        if (address) {
          await fetchTokens(gameAddress, address);
        }

        // Get auction times, state and current bid first
        const [auctionTimeData, currentAuctionTimeData, auctionStateData, currentBidAmount] = await Promise.all([
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
          fetchCurrentBid(gameAddress),
        ]);

        setAuctionDuration(Number(auctionTimeData));
        setCurrentAuctionTime(Number(currentAuctionTimeData));
        setAuctionState(auctionStateData);
        setCurrentBid(currentBidAmount);

        // Then fetch player details and bids
        const [details, bidsData] = await Promise.all([
          fetchPlayerDetails(parseInt(tokenId)),
          fetchPlayerBids(gameAddress, parseInt(tokenId)),
        ]);

        setPlayerDetails({
          image: details.imageURI,
          name: details.name,
          role: details.role,
        });
        setBids(bidsData);

        // Calculate initial time remaining
        const now = Math.floor(Date.now() / 1000);
        const nextAuctionTime = Number(currentAuctionTimeData) + Number(auctionTimeData);
        setTimeRemaining(Math.max(0, nextAuctionTime - now));

      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error?.message || "Failed to load player data. Please try again later.");
        toast.error("Failed to load player data");
      } finally {
        setLoading(false);
      }
    };

    if (gameAddress && tokenId) {
      fetchData();
    }
  }, [gameAddress, tokenId, address]);

  useWatchContractEvent({
    address: gameAddress as `0x${string}`,
    abi: GameABI,
    eventName: "BidPlaced",
    onLogs: async () => {
      const [bidsData, currentBidAmount] = await Promise.all([
        fetchPlayerBids(gameAddress, parseInt(tokenId)),
        fetchCurrentBid(gameAddress),
      ]);
      setBids(bidsData);
      setCurrentBid(currentBidAmount);
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
      
      const [bidsData, currentBidAmount] = await Promise.all([
        fetchPlayerBids(gameAddress, parseInt(tokenId)),
        fetchCurrentBid(gameAddress),
      ]);
      setBids(bidsData);
      setCurrentBid(currentBidAmount);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place bid", { id: "bidding" });
    }
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

  const isAuctionActive = parseInt(tokenId) >= currentPlayer && auctionState;

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <Image
              src={`${playerDetails.image.replace("ipfs://", "https://ipfs.io/ipfs/")}/${playerDetails.name
                .split(" ")
                .join("%20")}.png`}
              alt={playerDetails.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              unoptimized
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                  {playerDetails.name.toUpperCase()}
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge className={cn(
                    "px-3 py-1 text-sm",
                    isAuctionActive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  )}>
                    {isAuctionActive ? "AVAILABLE" : "SOLD"}
                  </Badge>
                  {isAuctionActive && timeRemaining > 0 && (
                    <Badge className="px-3 py-1 text-sm bg-purple-500/10 text-purple-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.floor(timeRemaining / 60)}m {timeRemaining % 60}s
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-gray-400 mb-6">{playerDetails.role}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center p-4">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Current Bid</p>
                      <p className="text-lg font-semibold text-white">
                        {formatEther(currentBid)} ETH
                      </p>
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

            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold text-white mb-4">Bid History</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto">
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
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">
                              <p className="text-gray-300">
                                {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(bid.timestamp * 1000).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">
                              {formatEther(bid.amount)} ETH
                            </span>
                            {index === 0 && (
                              <ArrowUp className="w-4 h-4 text-green-500" />
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
              disabled={!isAuctionActive || !address || timeRemaining <= 0}
              className={cn(
                "w-full py-6 text-lg font-semibold",
                isAuctionActive && timeRemaining > 0
                  ? "bg-purple-500 hover:bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              )}
            >
              {!address
                ? "Connect Wallet to Bid"
                : !isAuctionActive
                ? "Auction Ended"
                : timeRemaining <= 0
                ? "Time's Up"
                : `Place Bid (${formatEther(currentBid)} ETH)`}
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