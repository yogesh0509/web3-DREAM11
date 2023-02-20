import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';

import Table from "../components/Table";

const ContractAbi = require("../constants/ContractAbi.json")

export default function registrants({ registrants, numPlayerPurchased, moneyspent, count, playersBought, withdrawableAmount }) {
    return (
        <>
            <br />
            <Table
                registrants={registrants}
                numPlayerPurchased={numPlayerPurchased}
                moneyspent={moneyspent}
                count={count}
                playersBought={playersBought}
                withdrawableAmount={withdrawableAmount} />
        </>
    )
}

export async function getServerSideProps(context) {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

    let abi = JSON.parse(ContractAbi["Marketplace"])
    let address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
    let functionName = "getBuyers"

    let response = await Moralis.EvmApi.utils.runContractFunction({
        abi,
        functionName,
        address,
        chain: EvmChain.GOERLI,
    });
    const registrants = response.result
    const numPlayerPurchased = []
    const moneyspent = []
    const playersBought = []
    for (let player of registrants) {

        functionName = "getPlayersPurchased"
        response = await Moralis.EvmApi.utils.runContractFunction({
            abi,
            params: {
                registrant: player
            },
            functionName,
            address,
            chain: EvmChain.GOERLI,
        });
        numPlayerPurchased.push(response.result)
        functionName = "moneyspent"
        response = await Moralis.EvmApi.utils.runContractFunction({
            abi,
            params: {
                registrant: player
            },
            functionName,
            address,
            chain: EvmChain.GOERLI,
        });
        moneyspent.push(response.result)
        functionName = "fetchPlayers"
        response = await Moralis.EvmApi.utils.runContractFunction({
            abi,
            params: {
                registrant: player
            },
            functionName,
            address,
            chain: EvmChain.GOERLI,
        });
        playersBought.push(response.result)
    }
    abi = JSON.parse(ContractAbi["AuctionHouse"])
    address = process.env.NEXT_PUBLIC_AUCTIONHOUSE_CONTRACT_ADDRESS;
    functionName = "getPendingReturns"
    const withdrawableAmount = []

    for (let player of registrants) {
        response = await Moralis.EvmApi.utils.runContractFunction({
            abi,
            params: {
                player: player
            },
            functionName,
            address,
            chain: EvmChain.GOERLI,
        });
        withdrawableAmount.push(response.result)
    }

    return {
        props: {
            registrants: registrants,
            numPlayerPurchased: numPlayerPurchased,
            moneyspent: moneyspent,
            count: registrants.length,
            playersBought: playersBought,
            withdrawableAmount: withdrawableAmount
        },
    };
}
