import { config } from "@/config";
import React, { createContext, useState, ReactNode } from "react";
import { readContract } from "@wagmi/core";
import GameABI from "../constants/Game.json";

interface ContractContextType {
  PICAddress: string;
  currentPlayer: number;
  dreamToken: number;
  PICAddresssetup: (gameAddress: string) => Promise<void>;
  fetchTokens: (gameAddress: string, address: string) => Promise<void>;
  fetchcurrentPlayer: (gameAddress: string) => Promise<void>;
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
      if (!gameAddress || gameAddress === "") {
        console.error("Game address not initialized");
        return;
      }
      
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
      if (!gameAddress || gameAddress === "" || !address) {
        console.error("Game address or user address not initialized");
        return;
      }
      
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
      if (!gameAddress || gameAddress === "") {
        console.error("Game address not initialized");
        return;
      }
      
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

  return (
    <ContractContext.Provider
      value={{
        PICAddress,
        currentPlayer,
        dreamToken,
        PICAddresssetup,
        fetchTokens,
        fetchcurrentPlayer,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}; 