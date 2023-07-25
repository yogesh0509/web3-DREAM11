import React, { useEffect, useState, useContext } from "react"
import { useRouter } from 'next/router'
import { readContract } from "wagmi/actions"
import { useAccount } from "wagmi"
import { createTheme, ThemeProvider } from '@mui/material'
import { grey } from '@mui/material/colors'

import { ContractContext } from "../../../context/ContractContext"

import Table from "../../../components/Table"
const abi = require("../../../constants/abi.json")

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: grey[900],
        },
        background: {
            default: grey[900],
        },
    },
});

export default function leaderboard({ GameAddress }) {

    const { address } = useAccount()
    const [account] = useState(address)
    const router = useRouter()
    const GamecontractABI = JSON.parse(abi["Game"])
    const { fetchTokens } = useContext(ContractContext);

    const [registrants, setregistrants] = useState([])
    const [numPlayerPurchased, setnumPlayerPurchased] = useState([])
    const [playersBought, setplayersBought] = useState([])
    const [winner, setwinner] = useState("")
    const [winnerAmount, setWinnerAmount] = useState(0)
    const [updateComplete, setUpdateComplete] = useState(false);

    useEffect(() => {
        const func = async () => {
            await fetchLeaderboard()
            await fetchTokens(GameAddress, address)
        }
        func()
    }, [updateComplete])

    useEffect(() => {
        if (account != address)
            router.push("/")
    }, [address])

    const fetchLeaderboard = async () => {
        const data = await readContract({
            address: GameAddress,
            abi: GamecontractABI,
            functionName: "getBuyers",
        });
        setregistrants(data);

        const playerDataPromises = data.map(async (player) => {
            const countResponse = readContract({
                address: GameAddress,
                abi: GamecontractABI,
                functionName: "s_BuyerTransactionCount",
                args: [player],
            });
            const playerDetailsResponse = readContract({
                address: GameAddress,
                abi: GamecontractABI,
                functionName: "fetchPlayers",
                args: [player],
            });

            return Promise.all([countResponse, playerDetailsResponse]).then((responses) => {
                return {
                    count: parseInt(responses[0]),
                    playerDetails: responses[1],
                };
            });
        });


        const playerData = await Promise.all(playerDataPromises);
        const counts = playerData.map((item) => item.count);
        const playerDetails = playerData.map((item) => item.playerDetails);
        setnumPlayerPurchased(counts);
        setplayersBought(playerDetails);

        const winnerdata = await readContract({
            address: GameAddress,
            abi: GamecontractABI,
            functionName: "s_winner",
        });
        setwinner(winnerdata);

        const winnerAmountdata = await readContract({
            address: GameAddress,
            abi: GamecontractABI,
            functionName: "s_winnerFunds",
            args: [winnerdata],
        });
        setWinnerAmount(parseInt(winnerAmountdata));

        setUpdateComplete(true);
    };

    return (
        <>
            {!updateComplete ? (
                <div>Loading...</div> // Display loading message while data is being fetched
            ) : (
                <ThemeProvider theme={darkTheme}>
                    <Table
                        registrants={registrants}
                        numPlayerPurchased={numPlayerPurchased}
                        moneyspent={0}
                        playersBought={playersBought}
                        withdrawableAmount={0}
                        winner={winner}
                        winnerAmount={winnerAmount}
                    />
                </ThemeProvider>
            )}
        </>
    );
}

export async function getServerSideProps(context) {

    const GameAddress = context.params.gameAddress
    return {
        props: {
            GameAddress: GameAddress
        },
    };
}