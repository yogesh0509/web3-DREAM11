import React from "react";
import { useRouter } from 'next/router'

export default function PlayerCard(props) {
    const router = useRouter()
    const { query } = router

    const playerDetails = () => {
        router.push(`${query.gameAddress}/player-details/${props.id}`)
    }
    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="md:col-span-2 lg:col-span-3">
                        <button onClick={playerDetails}>
                            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <img
                                    className="w-full h-64 object-cover"
                                    src={props.image.replace("ipfs://", "https://ipfs.io/ipfs/") + "/" + props.name.split(' ').join('%20') + ".png"}
                                    alt="NFT Image"
                                />
                                <div className="p-4">
                                    <p className="text-lg text-white font-medium">
                                        {props.name.toUpperCase()}
                                    </p>
                                    <p className="mt-2 text-gray-300">
                                        {props.role.toUpperCase()}
                                    </p>
                                    <div className={`mt-4 inline-block ${props.id < props.currentPlayer ? "bg-red-400" : "bg-indigo-600"} text-white font-medium py-2 px-4 rounded`}>
                                        {props.id < props.currentPlayer ? "SOLD OUT" : "BID"}
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};