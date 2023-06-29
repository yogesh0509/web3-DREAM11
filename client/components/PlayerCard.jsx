import React from "react";

export default function PlayerCard() {
    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="md:col-span-2 lg:col-span-3">
                        <a href="/nft-details">
                            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <img
                                    className="w-full h-64 object-cover"
                                    src="nft-image1.jpg"
                                    alt="NFT Image"
                                />
                                <div className="p-4">
                                    <p className="text-lg text-white font-medium">
                                        NFT Title
                                    </p>
                                    <p className="mt-2 text-gray-300">
                                        NFT Description
                                    </p>
                                    <a href="/nft-details" className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-400 text-white font-medium py-2 px-4 rounded">
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};