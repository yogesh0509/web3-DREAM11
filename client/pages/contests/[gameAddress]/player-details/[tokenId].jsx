import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { ContractContext } from "../../../../context/ContractContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, DollarSign, Users } from "lucide-react";
import { config } from "@/config";

const abi = require("../../../../constants/abi.json");
const GamecontractABI = JSON.parse(abi["Game"]);
const PICcontractABI = JSON.parse(abi["PIC"]);

const PlayerDetails = ({ gameAddress, tokenId }) => {
  const [transactions, setTransactions] = useState([]);
  const [bid, setBid] = useState(0);
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [auctionTime, setAuctionTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const { address } = useAccount();
  const router = useRouter();
  const { PICAddress, PICAddresssetup, fetchTokens, currentPlayer, fetchcurrentPlayer } =
    useContext(ContractContext);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        await PICAddresssetup(gameAddress);
        await fetchcurrentPlayer(gameAddress);
        await fetchTokens(gameAddress, address || "");

        if (PICAddress) {
          const data = await readContract(config, {
            address: PICAddress,
            abi: PICcontractABI,
            functionName: "getplayerDetails",
            args: [tokenId],
          });
          console.log(data)
          setImage(data.imageURI);
          setName(data.name);
        }

        const auctionTimeData = await readContract(config, {
          address: gameAddress,
          abi: GamecontractABI,
          functionName: "s_auctionTime",
        });
        setAuctionTime(parseInt(auctionTimeData));

        updateUIValues();
      } catch (error) {
        console.error("Error fetching player data:", error);
        toast.error("Failed to load player data");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [PICAddress, currentPlayer, fetchTokens, address, gameAddress, tokenId]);

  useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  const bidAuctionFunction = async () => {
    toast.loading("Placing bid...", { id: "bidding" });
    try {
      const { hash } = await writeContract(config, {
        address: gameAddress,
        abi: GamecontractABI,
        functionName: "bid",
      });
      await waitForTransactionReceipt(config, { hash });
      toast.success("Bid placed successfully", { id: "bidding" });
      updateUIValues();
    } catch (err) {
      console.error(err);
      toast.error("Failed to place bid", { id: "bidding" });
    }
  };

  const updateUIValues = async () => {
    const bidData = await readContract(config, {
      address: gameAddress,
      abi: GamecontractABI,
      functionName: "s_biddingPrice",
    });
    setBid(parseInt(bidData));
  };

  const highestBid =
    transactions.length > 0 ? Math.max(...transactions.map((t) => t.bid)) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
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
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <Image
              src={`${image.replace("ipfs://", "https://ipfs.io/ipfs/")}/${name
                .split(" ")
                .join("%20")}.png`}
              alt={name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-4">
                {name.toUpperCase()}
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center p-4">
                    <Clock className="w-5 h-5 mr-2 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Auction Time</p>
                      <p className="text-lg font-semibold">{auctionTime}s</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center p-4">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Highest Bid</p>
                      <p className="text-lg font-semibold">{highestBid} DT</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 mr-2 text-purple-500" />
                  <h2 className="text-xl font-semibold">Bid History</h2>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <AnimatePresence>
                    {transactions.map((tx, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <p className="text-sm text-gray-400">
                            {tx.bidder.slice(0, 6)}...{tx.bidder.slice(-4)}
                          </p>
                          <Badge
                            variant="secondary"
                            className="bg-purple-500/10 text-purple-500"
                          >
                            {tx.bid} DT
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={bidAuctionFunction}
              disabled={parseInt(tokenId) < currentPlayer}
              className="bg-purple-500 text-white hover:bg-purple-600"
            >
              Bid Now
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerDetails;