import Moralis from 'moralis';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";
import { EvmChain } from '@moralisweb3/evm-utils';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, push, update } from "firebase/database";
import { useCookies } from 'react-cookie';
import Typography from '@mui/material/Typography';
import Countdown from 'react-countdown';
import styles from "./Player.module.css"

const ContractAbi = require("../../constants/ContractAbi.json")

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

export function UpdateTx(props) {
    return (
        <>
            {props.tx
                ? props.tx.map((tx, index) =>
                    <div key={index}>
                        <span>{tx.bidder}: </span>
                        <span>{ethers.utils.formatEther(tx.bid, "ether")}ETH </span>
                        <br />
                    </div>
                )
                : <></>}
        </>
    )
}

export default function player_details({ metadata, tokenId, bid, curr_auction_player }) {

    const [isTransaction, setTransaction] = useState([])
    const { isWeb3Enabled } = useMoralis();
    const [cookies, setCookie] = useCookies(['time']);
    const [cookiesState, setCookieState] = useCookies(['state']);

    const dispatch = useNotification();
    const abi = JSON.parse(ContractAbi["Marketplace"])
    const MarketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIvalues()
        }
    }, [isWeb3Enabled])

    const handleSuccessNotification = () => {
        dispatch({
            type: "success",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
        })
    }

    const handleErrorNotification = () => {
        dispatch({
            type: "error",
            message: "Error!",
            title: "Error",
            position: "topR",
        })
    }

    const { runContractFunction: bidAuction,
        isLoading,
        isFetching, } = useWeb3Contract({
            abi: abi,
            contractAddress: MarketplaceAddress,
            functionName: "bid",
            msgValue: bid,
            params: {}
        })

    async function bidAuctionFunction() {
        await bidAuction({
            throwOnError: (err) => {
                console.log(err)
            },
            onSuccess: async (tx) => {
                console.log(tx)
                const txReceipt = await tx.wait(1)
                posttx(txReceipt.from)
                updateUIvalues()
                handleSuccessNotification()
            },
            onError: (err) => {
                console.log(err)
                handleErrorNotification()
            }
        })
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

    function updateUIvalues() {
        onValue(ref(db, `/${tokenId}`), (snapshot) => {
            setTransaction(snapshot.val())
        }, {
            onlyOnce: true
        });
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
        <div className={styles.app}>
            {/* <Typography variant="h6" gutterBottom>
                Bid in 
            </Typography> */}
            {isWeb3Enabled && tokenId == curr_auction_player
                ? <Countdown
                    date={parseInt(cookies.time) + 900000}
                    renderer={props =>
                        <Typography variant="h3" gutterBottom className={styles.countdown}>
                            {props.minutes < 10
                                ? <span>0{props.minutes}</span>
                                : <span>{props.minutes}</span>}
                            :{props.seconds < 10
                                ? <span>0{props.seconds} </span>
                                : <span>{props.seconds} </span>}
                        </Typography>} />
                : <></>}
            <div className={styles.details} key={metadata.attributes[2].value}>
                <div className={styles.big_img}>
                    <img src={metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")} alt="" className={tokenId != curr_auction_player ? styles.parent_img_sold : styles.parent_img} />
                    {tokenId < curr_auction_player
                        ? <div className={styles.image_over}><img className={styles.icon_img} src="/sold.png" /></div>
                        : tokenId > curr_auction_player
                            ? <div className={styles.image_over}><img className={styles.icon_img} src="/soon.png" /></div>
                            : <></>
                    }
                </div>

                <div className={styles.box}>
                    <div className={styles.row}>
                        <h3 style={{ color: "red" }}>{ethers.utils.formatEther(highestBid(), "ether")}ETH </h3>
                    </div>
                    <UpdateTx tx={isTransaction} />
                    <button className={styles.cart} onClick={bidAuctionFunction}
                        disabled={isLoading || isFetching || tokenId != curr_auction_player || cookiesState.state == "true"}>{tokenId < curr_auction_player ? "SOLD OUT" : "BID"}</button>

                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

    let address = process.env.NEXT_PUBLIC_IDENTITYNFT_CONTRACT_ADDRESS;
    const abi = JSON.parse(ContractAbi["Marketplace"])

    let tokenId = context.params.tokenId
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
        address,
        chain: EvmChain.SEPOLIA,
        tokenId,
    });

    address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS
    let functionName = "getAuctionBid"
    let res = await Moralis.EvmApi.utils.runContractFunction({
        abi,
        functionName,
        address,
        chain: EvmChain.SEPOLIA,
    });
    const bid = res.result

    functionName = "getCurrentPlayerCount"
    address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;

    res = await Moralis.EvmApi.utils.runContractFunction({
        abi,
        functionName,
        address,
        chain: EvmChain.SEPOLIA,
    });
    const curr_auction_player = res.result

    return {
        props: {
            metadata: response.result.metadata,
            tokenId: context.params.tokenId,
            bid: bid,
            curr_auction_player: curr_auction_player,
        },
    };
}