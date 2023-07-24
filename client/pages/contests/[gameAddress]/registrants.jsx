import React, { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import {
    readContract
} from "wagmi/actions"
import { useAccount } from "wagmi"

// import Table from "../.../../components/Table"
const abi = require("../../../constants/abi.json")

export default function Registrants({ GameAddress }) {

    const { address } = useAccount()
    const [account] = useState(address)
    const router = useRouter()
    const GamecontractABI = JSON.parse(abi["Game"])

    const [registrants, setregistrants] = useState([])
    const [numPlayerPurchased, setnumPlayerPurchased] = useState([])
    const [playersBought, setplayersBought] = useState([])

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    useEffect(() => {
        if (account != address)
            router.push("/")
    }, [address])

    const fetchLeaderboard = async () => {
        let response
        let count = [], player_details = []

        let data = await readContract({
            address: GameAddress,
            abi: GamecontractABI,
            functionName: "getBuyers"
        })
        setregistrants(data)
        const arr = data

        for (let player of arr) {
            data = await readContract({
                address: GameAddress,
                abi: GamecontractABI,
                functionName: "s_BuyerTransactionCount",
                args: [player]
            })
            count.push(data)

            response = await readContract({
                address: GameAddress,
                abi: GamecontractABI,
                functionName: "fetchPlayers",
                args: [player]
            })
            count.push(data)
            player_details.push(response)
        }
        setnumPlayerPurchased(count)
        setplayersBought(player_details)
    }

    return (
        <>
            <br />
            {/* <Table
                registrants={registrants}
                numPlayerPurchased={numPlayerPurchased}
                moneyspent={moneyspent}
                count={count}
                playersBought={playersBought}
                withdrawableAmount={withdrawableAmount}
                winner={winner}
                winnerAmount={winnerAmount} /> */}
        </>
    )
}

export async function getServerSideProps(context) {

    const GameAddress = context.params.gameAddress
    // await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

    // let abi = JSON.parse(ContractAbi["Marketplace"])
    // let address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
    // let functionName = "getBuyers"

    // let response = await Moralis.EvmApi.utils.runContractFunction({
    //     abi,
    //     functionName,
    //     address,
    //     chain: EvmChain.MUMBAI,
    // });
    // const registrants = response.result
    // const numPlayerPurchased = []
    // const moneyspent = []
    // const playersBought = []
    // for (let player of registrants) {

    //     functionName = "getPlayersPurchased"
    //     response = await Moralis.EvmApi.utils.runContractFunction({
    //         abi,
    //         params: {
    //             registrant: player
    //         },
    //         functionName,
    //         address,
    //         chain: EvmChain.MUMBAI,
    //     });
    //     numPlayerPurchased.push(response.result)
    //     functionName = "moneyspent"
    //     response = await Moralis.EvmApi.utils.runContractFunction({
    //         abi,
    //         params: {
    //             registrant: player
    //         },
    //         functionName,
    //         address,
    //         chain: EvmChain.MUMBAI,
    //     });
    //     moneyspent.push(response.result)
    //     functionName = "fetchPlayers"
    //     response = await Moralis.EvmApi.utils.runContractFunction({
    //         abi,
    //         params: {
    //             registrant: player
    //         },
    //         functionName,
    //         address,
    //         chain: EvmChain.MUMBAI,
    //     });
    //     playersBought.push(response.result)
    // }

    // functionName = "getWinner"
    // response = await Moralis.EvmApi.utils.runContractFunction({
    //     abi,
    //     functionName,
    //     address,
    //     chain: EvmChain.MUMBAI,
    // });
    // let winner = response.result

    // functionName = "getWinnerFunds"
    // response = await Moralis.EvmApi.utils.runContractFunction({
    //     abi,
    //     functionName,
    //     address,
    //     chain: EvmChain.MUMBAI,
    // });
    // let winnerAmount = response.result

    // abi = JSON.parse(ContractAbi["AuctionHouse"])
    // address = process.env.NEXT_PUBLIC_AUCTIONHOUSE_CONTRACT_ADDRESS;
    // functionName = "getPendingReturns"
    // const withdrawableAmount = []

    // for (let player of registrants) {
    //     response = await Moralis.EvmApi.utils.runContractFunction({
    //         abi,
    //         params: {
    //             player: player
    //         },
    //         functionName,
    //         address,
    //         chain: EvmChain.MUMBAI,
    //     });
    //     withdrawableAmount.push(response.result)
    // }

    // return {
    //     props: {
    //         registrants: registrants,
    //         numPlayerPurchased: numPlayerPurchased,
    //         moneyspent: moneyspent,
    //         count: registrants.length,
    //         playersBought: playersBought,
    //         withdrawableAmount: withdrawableAmount, 
    //         winner: winner,
    //         winnerAmount: winnerAmount
    //     },
    // };

    return {
        props: {
            GameAddress: GameAddress,
            registrants: "",
            numPlayerPurchased: "numPlayerPurchased",
            moneyspent: "moneyspent",
            count: "",
            playersBought: "playersBought",
            withdrawableAmount: "withdrawableAmount",
            winner: "winner",
            winnerAmount: "winnerAmount"
        },
    };
}
