import React, { useEffect, useState, useContext } from "react";
// import Countdown from 'react-countdown';
import toast from "react-hot-toast";
import { useRouter } from 'next/router'

import { useAccount } from 'wagmi'
import { prepareWriteContract, readContract, waitForTransaction, writeContract } from "wagmi/actions"

import firebase from 'firebase/app'
// import { firebaseConfig } from "../../../../constants/firebaseConfig.js"
import { ContractContext } from "../../../../context/ContractContext"

// import Timer from "../../../../components/Timer";
const abi = require("../../../../constants/abi.json")

const GamecontractABI = JSON.parse(abi["Game"])
const PICcontractABI = JSON.parse(abi["PIC"])

export function UpdateTx(props) {
    return (
        <>
            {props.tx
                ?
                <div className="flex items-center">
                    <p className="mr-2">{props.tx.bidder}: </p>
                    <p className="text-sm text-gray-400">{props.tx.bid}DT </p>
                </div>

                : <></>}
        </>
    )
}

export default function Player_details({ gameAddress, tokenId }) {

    const [isTransaction, setTransaction] = useState([])
    const [bid, setbid] = useState(0)
    const [Image, setImage] = useState("")
    const [Name, setName] = useState("")
    const [AuctionTime, setAuctionTime] = useState(0)

    const { address } = useAccount()
    const [account] = useState(address)
    const router = useRouter()
    const { PICAddress, PICAddresssetup, fetchTokens, currentPlayer, fetchcurrentPlayer } = useContext(ContractContext)
    const Ref = firebase.database().ref(`${gameAddress}/${tokenId}`)

    useEffect(() => {
        const fetchImage = async () => {

            await PICAddresssetup(gameAddress)
            await fetchcurrentPlayer(gameAddress)
            await fetchTokens(gameAddress, address)

            if (PICAddress) {
                const data = await readContract({
                    address: PICAddress,
                    abi: PICcontractABI,
                    functionName: "getplayerDetails",
                    args: [tokenId]
                })
                setImage(data.imageURI)
                setName(data.name)
            }
            const data = await readContract({
                address: gameAddress,
                abi: GamecontractABI,
                functionName: "s_auctionTime"
            })
            setAuctionTime(parseInt(data))
        }
        fetchImage()
    }, [PICAddress, currentPlayer, fetchTokens])

    useEffect(() => {
        updateUIvalues()
    }, [isTransaction, bid])

    useEffect(() => {
        if (account != address)
            router.push("/")
    }, [address])

    const bidAuctionFunction = async () => {

        toast.dismiss("connecting");
        toast.loading("Connecting with contract", {
            id: "connect",
        });
        try {
            const { request, result } = await prepareWriteContract({
                address: gameAddress,
                abi: GamecontractABI,
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

        Ref.once('value')
            .then((snapshot) => {
                const data = snapshot.val();

                // Modify the data (for example, update 'key2')
                const newData = {
                    ...data,
                    postData // Modify 'key2' with a new value
                };

                // Update data at path 'xyz'
                return Ref.update(newData);
            })
            .then(() => {
                console.log("Data updated successfully!");
            })
            .catch((error) => {
                console.error("Firebase error:", error);
            });
        // const newPostKey = push(child(ref(db), `transaction`)).key
        // const updates = {};

        // onValue(ref(db, `/${gameAddress}/${tokenId}`), (snapshot) => {
        //     if (snapshot.val() == null) {
        //         updates[tokenId] = [postData]
        //     }
        //     else {
        //         updates[tokenId] = snapshot.val()
        //         updates[tokenId].push(postData)
        //     }
        //     return update(ref(db), updates);
        // }, {
        //     onlyOnce: true
        // });
    }

    const updateUIvalues = async () => {
        Ref.once('value')
            .then((snapshot) => {
                setTransaction(snapshot.val().postData)
            })
            .catch((error) => {
                console.error("Firebase error:", error);
            });

        const data = await readContract({
            address: gameAddress,
            abi: GamecontractABI,
            functionName: "s_biddingPrice"
        })
        setbid(parseInt(data))
    }

    function highestBid() {
        // let max = 0;
        // if (isTransaction && isTransaction.length > 0) {
        //     for (let ele of isTransaction) {
        //         if (ele.bid > max) {
        //             max = ele.bid;
        //         }
        //     }
        // }
        // return max;
        return isTransaction.bid
    }

    return (
        <div className="bg-neutral-900 text-white min-h-screen">
            <div className="container mx-auto my-auto px-4 py-8 flex flex-col md:flex-row">
                <div className="md:w-1/2">
                    {/* {address && tokenId == currentPlayer
                        ? <Countdown
                            date={parseInt(localStorage.getItem('time')) + AuctionTime * 1000}
                            renderer={props =>
                                <Timer minutes={props.minutes} seconds={props.seconds} />
                            } />
                        : <></>} */}
                    <img src={Image.replace("ipfs://", "https://ipfs.io/ipfs/") + "/" + Name.split(' ').join('%20') + ".png"} alt="Player" className="w-3/4" />
                </div>
                <div className="md:w-1/2 mt-8 md:mt-0">
                    <div className="flex flex-col justify-center items-center">
                        <h2 className="text-2xl font-bold mb-4">{Name.toUpperCase()}</h2>
                        <p className="text-lg mb-4">Current Bid: {highestBid()}DT</p>
                        <div className="text-white p-4 max-h-72 overflow-y-auto">
                            <div className="flex flex-col space-y-1">
                                <UpdateTx tx={isTransaction} />
                            </div>
                        </div>
                        <button className="bg-red-500 text-white py-2 px-4 rounded mt-4"
                            onClick={bidAuctionFunction}>
                            {/* disabled={tokenId != currentPlayer || localStorage.getItem('state') == "true"} */}
                            {tokenId < currentPlayer ? "SOLD OUT" : "BID"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {

    const gameAddress = context.params.gameAddress
    const ID = context.params.tokenId

    return {
        props: {
            gameAddress: gameAddress,
            tokenId: ID
        }
    };
}