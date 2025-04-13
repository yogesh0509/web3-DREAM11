import { config } from "@/config";
import React, { createContext, useState, ReactNode } from "react";
import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { parseEther, formatEther } from "ethers";
import GameABI from "../constants/Game.json";
import PICABI from "../constants/PIC.json";

interface PlayerDetails {
  imageURI: string;
  name: string;
  role: string;
  id: number;
}

interface BidEvent {
  bidder: string;
  amount: bigint;
  timestamp: number;
}

interface ContractContextType {
  PICAddress: string;
  currentPlayer: number;
  dreamToken: number;
  PICAddresssetup: (gameAddress: string) => Promise<void>;
  fetchTokens: (gameAddress: string, address: string) => Promise<void>;
  fetchcurrentPlayer: (gameAddress: string) => Promise<void>;
  fetchPlayerDetails: (tokenId: number) => Promise<PlayerDetails>;
  fetchTotalPlayers: () => Promise<number>;
  fetchPlayerBids: (gameAddress: string, tokenId: number) => Promise<BidEvent[]>;
  fetchCurrentBid: (gameAddress: string) => Promise<bigint>;
  fetchAuctionState: (gameAddress: string) => Promise<boolean>;
  fetchBuyers: (gameAddress: string) => Promise<string[]>;
  fetchBuyerTransactions: (gameAddress: string, buyer: string) => Promise<number>;
  fetchWinner: (gameAddress: string) => Promise<string>;
  fetchWinnerFunds: (gameAddress: string, winner: string) => Promise<bigint>;
  withdrawDreamToken: (gameAddress: string) => Promise<void>;
  withdrawWinnerFunds: (gameAddress: string) => Promise<void>;
}

export const ContractContext = createContext<ContractContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ProviderProps> = ({ children }) => {
  const [PICAddress, setPICAddress] = useState<string>("");
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [dreamToken, setDreamToken] = useState<number>(0);

  const PICAddresssetup = async (gameAddress: string) => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "getPICContract",
      });
      setPICAddress(data as string);
    } catch (error) {
      console.error("Error fetching PIC address:", error);
    }
  };

  const fetchTokens = async (gameAddress: string, address: string) => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_DreamToken",
        args: [address],
      });
      setDreamToken(Number(data));
    } catch (error) {
      console.error("Error fetching dream tokens:", error);
    }
  };

  const fetchcurrentPlayer = async (gameAddress: string) => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_currentplayercount",
      });
      setCurrentPlayer(Number(data));
    } catch (error) {
      console.error("Error fetching current player count:", error);
    }
  };

  const fetchPlayerDetails = async (tokenId: number): Promise<PlayerDetails> => {
    try {
      if (!PICAddress) {
        throw new Error("PICAddress not initialized");
      }

      const data = await readContract(config, {
        address: PICAddress as `0x${string}`,
        abi: PICABI,
        functionName: "getplayerDetails",
        args: [tokenId],
      }) as PlayerDetails;
      
      return data;
    } catch (error) {
      console.error("Error fetching player details:", error);
      throw error;
    }
  };

  const fetchTotalPlayers = async () => {
    try {
      const data = await readContract(config, {
        address: PICAddress as `0x${string}`,
        abi: PICABI,
        functionName: "getTotalPlayers",
      });
      return Number(data);
    } catch (error) {
      console.error("Error fetching total players:", error);
      throw error;
    }
  };

  const fetchPlayerBids = async (gameAddress: string, tokenId: number): Promise<BidEvent[]> => {
    try {
      if (!PICAddress) {
        console.warn("PICAddress not initialized");
        return [];
      }

      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_BuyerTransactionCount",
        args: [tokenId],
      });
      
      const count = Number(data);
      const bids: BidEvent[] = [];
      
      for (let i = 0; i < count; i++) {
        const bidData = await readContract(config, {
          address: gameAddress as `0x${string}`,
          abi: GameABI,
          functionName: "s_BuyerTransactions",
          args: [tokenId, i],
        }) as [string, bigint, bigint];
        
        bids.push({
          bidder: bidData[0],
          amount: bidData[1],
          timestamp: Number(bidData[2])
        });
      }
      
      return bids.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error fetching player bids:", error);
      return [];
    }
  };

  const fetchCurrentBid = async (gameAddress: string): Promise<bigint> => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_biddingPrice",
      });
      return data as bigint;
    } catch (error) {
      console.error("Error fetching current bid:", error);
      return BigInt(0);
    }
  };

  const fetchAuctionState = async (gameAddress: string): Promise<boolean> => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_auctionState",
      });
      return Boolean(data);
    } catch (error) {
      console.error("Error fetching auction state:", error);
      return false;
    }
  };

  const fetchBuyers = async (gameAddress: string): Promise<string[]> => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "getBuyers",
      });
      return data as string[];
    } catch (error) {
      console.error("Error fetching buyers:", error);
      return [];
    }
  };

  const fetchBuyerTransactions = async (gameAddress: string, buyer: string): Promise<number> => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_BuyerTransactionCount",
        args: [buyer],
      });
      return Number(data);
    } catch (error) {
      console.error("Error fetching buyer transactions:", error);
      return 0;
    }
  };

  const fetchWinner = async (gameAddress: string): Promise<string> => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_winner",
      });
      return data as string;
    } catch (error) {
      console.error("Error fetching winner:", error);
      return "0x0000000000000000000000000000000000000000";
    }
  };

  const fetchWinnerFunds = async (gameAddress: string, winner: string): Promise<bigint> => {
    try {
      const data = await readContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "s_winnerFunds",
        args: [winner],
      });
      return data as bigint;
    } catch (error) {
      console.error("Error fetching winner funds:", error);
      return BigInt(0);
    }
  };

  const withdrawDreamToken = async (gameAddress: string): Promise<void> => {
    try {
      const result = await writeContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "withdrawDreamToken",
      });
      if (typeof result === 'string') {
        await waitForTransactionReceipt(config, { hash: result });
      }
    } catch (error) {
      console.error("Error withdrawing dream token:", error);
      throw error;
    }
  };

  const withdrawWinnerFunds = async (gameAddress: string): Promise<void> => {
    try {
      const result = await writeContract(config, {
        address: gameAddress as `0x${string}`,
        abi: GameABI,
        functionName: "withdrawWinnerFunds",
      });
      if (typeof result === 'string') {
        await waitForTransactionReceipt(config, { hash: result });
      }
    } catch (error) {
      console.error("Error withdrawing winner funds:", error);
      throw error;
    }
  };

  return (
    <ContractContext.Provider
      value={{
        PICAddress,
        currentPlayer,
        dreamToken,
        PICAddresssetup,
        fetchTokens,
        fetchcurrentPlayer,
        fetchPlayerDetails,
        fetchTotalPlayers,
        fetchPlayerBids,
        fetchCurrentBid,
        fetchAuctionState,
        fetchBuyers,
        fetchBuyerTransactions,
        fetchWinner,
        fetchWinnerFunds,
        withdrawDreamToken,
        withdrawWinnerFunds,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}; 