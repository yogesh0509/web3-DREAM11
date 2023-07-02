// import Moralis from 'moralis';
// import { EvmChain } from '@moralisweb3/evm-utils';
import Table from "../components/Table";
const ContractAbi = require("../constants/ContractAbi.json")

export default function Registrants({ registrants, numPlayerPurchased, moneyspent, count, playersBought, withdrawableAmount, winner, winnerAmount }) {
    return (
        <>
            <br />
            <Table
                registrants={registrants}
                numPlayerPurchased={numPlayerPurchased}
                moneyspent={moneyspent}
                count={count}
                playersBought={playersBought}
                withdrawableAmount={withdrawableAmount}
                winner={winner} 
                winnerAmount={winnerAmount} />
        </>
    )
}

export async function getServerSideProps(context) {
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
