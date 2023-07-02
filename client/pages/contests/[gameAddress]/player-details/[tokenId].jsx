import React, { useEffect, useState } from "react";
import Countdown from 'react-countdown';
import toast from "react-hot-toast";
import { useRouter } from 'next/router'

import { ethers } from "ethers"
import { useAccount } from 'wagmi'
import {
    prepareWriteContract,
    readContract,
    waitForTransaction,
    writeContract,
} from "wagmi/actions"

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, push, update } from "firebase/database";
import { useCookies } from 'react-cookie';
import Typography from '@mui/material/Typography';
import Timer from "../../../../components/Timer";
import styles from "./Player.module.css"

const abi = require("../../../../constants/abi.json")

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: "https://auctionhouse-7ca3f-default-rtdb.firebaseio.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const ContractABI = JSON.parse(abi["Game"])
const PICcontractABI = JSON.parse(abi["PIC"])

export function UpdateTx(props) {
    return (
        <>
            {props.tx
                ? props.tx.map((tx, index) =>
                    <div className="flex items-center" key={index}>
                        <p className="mr-2">{tx.bidder}: </p>
                        <p className="text-sm text-gray-400">{ethers.utils.formatEther(tx.bid, "ether")}ETH </p>
                    </div>
                )
                : <></>}
        </>
    )
}

export default function Player_details({ GameAddress, tokenId }) {

    const [isTransaction, setTransaction] = useState([])
    const [bid, setbid] = useState(0)
    const [Image, setImage] = useState("")
    const [AuctionTime, setAuctionTime] = useState(0)
    const [CurrentPlayer, setCurrentPlayer] = useState(0)

    const { address } = useAccount()
    const [cookies, setCookie] = useCookies(['time']);
    const [cookiesState, setCookieState] = useCookies(['state']);

    useEffect(() => {
        const fetchImage = async () => {
            let data = await readContract({
                address: GameAddress,
                abi: ContractABI,
                functionName: "getPICContract"
            })
            const PICAddress = data;

            data = await readContract({
                address: PICAddress,
                abi: PICcontractABI,
                functionName: "getplayerDetails",
                args: [tokenId]
            })
            console.log(data)
            setImage(data.imageURI)

            data = await readContract({
                address: GameAddress,
                abi: ContractABI,
                functionName: "s_auctionTime"
            })
            console.log(data)
            setAuctionTime(parseInt(data))
        }
        fetchImage()
    }, [])

    useEffect(() => {
        if (address) {
            updateUIvalues()
        }
    }, [address, isTransaction])

    const bidAuctionFunction = async () => {

        toast.dismiss("connecting");
        toast.loading("Connecting with contract", {
            id: "connect",
        });
        try {
            const { request, result } = await prepareWriteContract({
                address: GameAddress,
                abi: ContractABI,
                functionName: "bid",
            });

            const { hash } = await writeContract(request);
            await waitForTransaction({ hash });
            toast.dismiss("connect");
            toast.success("Successfully registered");
            toast.custom("You'll be notified once approved", {
                icon: "ℹ️",
            });
            posttx(address)
            updateUIvalues()

        } catch (err) {
            toast.dismiss("connect");
            console.error(err);
            toast.error("Error connecting with contract");
        }
    }

    const posttx = async (bidder) => {
        const postData = {
            bidder: bidder,
            bid: bid

        }
        // const newPostKey = push(child(ref(db), `transaction`)).key
        const updates = {};

        onValue(ref(db, `/${tokenId}`), (snapshot) => {
            if (snapshot.val() == null) {
                updates[tokenId] = [postData]
            }
            else {
                updates[tokenId] = snapshot.val()
                updates[tokenId].push(postData)
            }
            return update(ref(db), updates);
        }, {
            onlyOnce: true
        });
    }

    const updateUIvalues = async () => {
        onValue(ref(db, `/${tokenId}`), (snapshot) => {
            setTransaction(snapshot.val())
        }, {
            onlyOnce: true
        });

        let data = await readContract({
            address: GameAddress,
            abi: ContractABI,
            functionName: "s_biddingPrice"
        })
        setbid(parseInt(data))

        data = await readContract({
            address: GameAddress,
            abi: ContractABI,
            functionName: "s_currentplayercount"
        })
        setCurrentPlayer(parseInt(data))
    }

    function highestBid() {
        let max = 0;
        if (isTransaction && isTransaction.length > 0) {
            for (let ele of isTransaction) {
                if (ele.bid > max) {
                    max = ele.bid;
                }
            }
        }
        return max;
    }

    return (
        <div className="bg-neutral-900 text-white min-h-screen">
            <div className="container mx-auto my-auto px-4 py-8 flex flex-col md:flex-row">
                <div className="md:w-1/2">
                    {address && tokenId == CurrentPlayer
                        ? <Countdown
                            date={parseInt(cookies.time) + AuctionTime * 1000}
                            renderer={props =>
                                <Timer minutes={props.minutes} seconds={props.seconds} />
                            } />
                        : <></>}
                    <img src={Image.replace("ipfs://", "https://ipfs.io/ipfs/") + "/virat%20kohli.png"} alt="Player" className="w-full h-auto" />
                </div>
                <div className="md:w-1/2 mt-8 md:mt-0">
                    <div className="flex flex-col justify-center items-center">
                        <h2 className="text-2xl font-bold mb-4">Virat Kohli</h2>
                        <p className="text-lg mb-4">Current Bid: {ethers.utils.formatEther(highestBid(), "ether")}ETH</p>
                        <div className="text-white p-4 max-h-72 overflow-y-auto">
                            <div className="flex flex-col space-y-1">
                                <UpdateTx tx={isTransaction} />
                            </div>
                        </div>
                        <button className="bg-green-500 hover:bg-green-400 text-white py-2 px-4 rounded mt-4"
                            onClick={bidAuctionFunction}
                            disabled={tokenId != CurrentPlayer || cookiesState.state == "true"}>
                            {tokenId < CurrentPlayer ? "SOLD OUT" : "BID"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        // <div className="max-w-4xl w-full mx-auto my-8 shadow-md">
        //     {address && tokenId == CurrentPlayer
        //         ? <Countdown
        //             date={parseInt(cookies.time) + AuctionTime * 1000}
        //             renderer={props =>
        //                 <Timer minutes={props.minutes} seconds={props.seconds} />
        //             } />
        //         : <></>}

        //     <div className={styles.details}>
        //         <div className={styles.big_img}>
        //             <img src={Image.replace("ipfs://", "https://ipfs.io/ipfs/") + "/virat%20kohli.png"} alt="" className={tokenId != CurrentPlayer ? styles.parent_img_sold : styles.parent_img} />
        //             {tokenId < CurrentPlayer
        //                 ? <div className={styles.image_over}><img className={styles.icon_img} src="/sold.png" /></div>
        //                 : tokenId > CurrentPlayer
        //                     ? <div className={styles.image_over}><img className={styles.icon_img} src="/soon.png" /></div>
        //                     : <></>
        //             }
        //         </div>
        //     </div>
        // </div>
    )
}

export async function getServerSideProps(context) {

    const GameAddress = context.params.gameAddress
    const ID = context.params.tokenId
    console.log(GameAddress, ID)

    return {
        props: {
            GameAddress: GameAddress,
            tokenId: ID
        }
    };
}