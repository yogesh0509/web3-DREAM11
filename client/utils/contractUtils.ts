import { config } from "@/config";
import { readContract, writeContract, waitForTransactionReceipt } from "@wagmi/core";
import GameABI from "../constants/Game.json";
import PICABI from "../constants/PIC.json";
import { getPublicClient } from "@wagmi/core";

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

export const fetchPlayerDetails = async (PICAddress: string, tokenId: number) => {
  try {
    // Ensure tokenId is within valid range
    if (tokenId < 0) {
      console.warn(`Invalid tokenId: ${tokenId}, must be >= 0`);
      return { imageURI: "", name: "", role: "" };
    }
    
    // Call the contract function
    const details = await readContract(config, {
      address: PICAddress as `0x${string}`,
      abi: PICABI,
      functionName: "getplayerDetails",
      args: [BigInt(tokenId)],
    });
    
    return details as { imageURI: string; name: string; role: string };
  } catch (error) {
    console.error(`Error fetching player details for token ${tokenId}:`, error);
    // Return empty data in case of error
    return { imageURI: "", name: "", role: "" };
  }
};

export const fetchTotalPlayers = async (PICAddress: string): Promise<number> => {
  try {
    if (!PICAddress || PICAddress === "") {
      throw new Error("PICAddress not initialized");
    }

    const data = await readContract(config, {
      address: PICAddress as `0x${string}`,
      abi: PICABI,
      functionName: "getTotalPlayers",
    });
    return Number(data);
  } catch (error) {
    console.error("Error fetching total players:", error);
    return 0;
  }
};

export const fetchPlayerBids = async (gameAddress: string, tokenId: number): Promise<BidEvent[]> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
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

export const fetchCurrentBid = async (gameAddress: string): Promise<bigint> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

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

export const getAuctionContract = async (gameAddress: string): Promise<string> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

    const data = await readContract(config, {
      address: gameAddress as `0x${string}`,
      abi: GameABI,
      functionName: "getAuctionContract",
    });
    console.log(data);
    return data as string;
  } catch (error) {
    console.error("Error fetching auction contract address:", error);
    return "0x0000000000000000000000000000000000000000";
  }
};

export const fetchAuctionState = async (gameAddress: string): Promise<boolean> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

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

export const fetchBuyers = async (gameAddress: string): Promise<string[]> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

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

export const fetchBuyerTransactions = async (gameAddress: string, buyer: string): Promise<number> => {
  try {
    if (!gameAddress || gameAddress === "" || !buyer) {
      throw new Error("Game address or buyer not initialized");
    }

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

export const fetchWinner = async (gameAddress: string): Promise<string> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

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

export const fetchWinnerFunds = async (gameAddress: string, winner: string): Promise<bigint> => {
  try {
    if (!gameAddress || gameAddress === "" || !winner) {
      throw new Error("Game address or winner not initialized");
    }

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

export const withdrawDreamToken = async (gameAddress: string): Promise<void> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

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

export const withdrawWinnerFunds = async (gameAddress: string): Promise<void> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

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

export const fetchPastBidEvents = async (gameAddress: string, tokenId: number): Promise<BidEvent[]> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

    const publicClient = getPublicClient(config);
    const auctionContract = await getAuctionContract(gameAddress);
    
    if (!auctionContract || auctionContract === "0x0000000000000000000000000000000000000000") {
      return [];
    }

    // Get the highest bid increase events filtered by the current player (tokenId)
    const highestBidEvents = await publicClient.getLogs({
      address: auctionContract as `0x${string}`,
      event: {
        type: 'event',
        name: 'HighestBidIncrease',
        inputs: [
          { type: 'address', name: 'bidder', indexed: false },
          { type: 'uint256', name: 'amount', indexed: false },
          { type: 'uint256', name: 'currentPlayer', indexed: false }
        ]
      },
      fromBlock: 'earliest',
      toBlock: 'latest',
      args: {
        currentPlayer: BigInt(tokenId)
      }
    });
    
    // Parse the events and map them to our BidEvent structure
    const parsedBids = highestBidEvents.map(event => {
      const args = (event as any).args;
      return {
        bidder: args.bidder,
        amount: args.amount,
        timestamp: Number(event.blockNumber) // Using block number as timestamp approximation
      };
    });
    
    // Sort bids by timestamp (newest first)
    return parsedBids.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error fetching past bid events:", error);
    return [];
  }
};

export const fetchPlayersBought = async (gameAddress: string, buyer: string) => {
  try {
    if (!gameAddress || gameAddress === "" || !buyer) {
      throw new Error("Game address or buyer not initialized");
    }

    const data = await readContract(config, {
      address: gameAddress as `0x${string}`,
      abi: GameABI,
      functionName: "fetchPlayers",
      args: [buyer],
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching player purchases:", error);
    return [];
  }
};

export const fetchTeamScore = async (gameAddress: string, buyer: string) => {
  try {
    if (!gameAddress || gameAddress === "" || !buyer) {
      throw new Error("Game address or buyer not initialized");
    }

    const data = await readContract(config, {
      address: gameAddress as `0x${string}`,
      abi: GameABI,
      functionName: "getTeamScore",
      args: [buyer],
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching team score:", error);
    return BigInt(0);
  }
};

export const getPICContract = async (gameAddress: string): Promise<string> => {
  try {
    if (!gameAddress || gameAddress === "") {
      throw new Error("Game address not initialized");
    }

    const data = await readContract(config, {
      address: gameAddress as `0x${string}`,
      abi: GameABI,
      functionName: "getPICContract",
    });
    return data as string;
  } catch (error) {
    console.error("Error fetching PIC contract:", error);
    return "0x0000000000000000000000000000000000000000";
  }
}; 