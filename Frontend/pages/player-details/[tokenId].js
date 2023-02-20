import Moralis from 'moralis';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";
import { EvmChain } from '@moralisweb3/evm-utils';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, push, update } from "firebase/database";
import Styles from "../../styles/Details.module.css"

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

export default function player_details({ metadata, tokenId }) {

    const [isTransaction, setTransaction] = useState([])
    const { isWeb3Enabled } = useMoralis();

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
            msgValue: 4e15 + 5e14,
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
            bid: 4e15 + 5e14

        }
        // const newPostKey = push(child(ref(db), `transaction`)).key
        const updates = {};

        onValue(ref(db, `/${tokenId}`), (snapshot) => {
            console.log(snapshot.val())
            if (snapshot.val() == null) {
                updates[tokenId] = [postData]
            }
            else {
                updates[tokenId = snapshot.val()]
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
        <div className={Styles.app}>
            <div className={Styles.details} key={metadata.attributes[2].value}>
                <div className={Styles.big_img}>
                    <img src={metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")} alt="" />
                </div>

                <div className={Styles.box}>
                    <div className={Styles.row}>
                        <h3 style={{ color: "red" }}>{ethers.utils.formatEther(highestBid(), "ether")}ETH </h3>
                    </div>
                    <UpdateTx tx={isTransaction} />

                    <button className={Styles.cart} onClick={bidAuctionFunction}
                        disabled={isLoading || isFetching}>BID</button>

                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

    const address = process.env.NEXT_PUBLIC_IDENTITYNFT_CONTRACT_ADDRESS;

    let tokenId = context.params.tokenId
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
        address,
        chain: EvmChain.GOERLI,
        tokenId,
    });
    
    // let functionName = "s_biddingPrice"
    // const res = await Moralis.EvmApi.utils.runContractFunction({
    //     abi,
    //     functionName,
    //     address,
    //     chain: EvmChain.GOERLI,
    //   });
    //   const bid = res.result


    // let functionName = "getCurrentPlayerCount"
    // const res = await Moralis.EvmApi.utils.runContractFunction({
    //     abi,
    //     functionName,
    //     address,
    //     chain: EvmChain.GOERLI,
    //   });
    //   const current_player = res.result

    return {
        props: {
            metadata: response.result.metadata,
            tokenId: context.params.tokenId
            // bid: bid
            // current_player: current_player
        },
    };
}