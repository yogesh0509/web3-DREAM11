import React, { createContext, useState } from "react"
import { readContract } from "wagmi/actions"
const abi = require("../constants/abi.json")

export const ContractContext = createContext();
// set the values at pages/contests/[gameAddress]

export const MyProvider = ({ children }) => {

  const GamecontractABI = JSON.parse(abi["Game"])
  const [PICAddress, setPICAddress] = useState("")
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [dreamToken, setdreamToken] = useState(0)


  const PICAddresssetup = async (gameAddress) => {
    const data = await readContract({
      address: gameAddress,
      abi: GamecontractABI,
      functionName: "getPICContract"
    })
    setPICAddress(data)
  }

  const fetchTokens = async (gameAddress, address) => {
    const data = await readContract({
      address: gameAddress,
      abi: GamecontractABI,
      functionName: "s_DreamToken",
      args: [address]
    })
    setdreamToken(parseInt(data))
  }

  const fetchcurrentPlayer = async (gameAddress) => {
    const data = await readContract({
      address: gameAddress,
      abi: GamecontractABI,
      functionName: "s_currentplayercount"
    })
    setCurrentPlayer(parseInt(data))
  }

  return (
    <ContractContext.Provider value={{ PICAddress, PICAddresssetup, dreamToken, fetchTokens, currentPlayer, fetchcurrentPlayer }}>
      {children}
    </ContractContext.Provider>
  );
};