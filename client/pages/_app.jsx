import React, { useEffect, useState } from "react"
import '../styles/globals.css'
import "@rainbow-me/rainbowkit/styles.css"
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from "@rainbow-me/rainbowkit"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { polygonMumbai } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"
import { alchemyProvider } from 'wagmi/providers/alchemy'

import { useRouter } from 'next/router';
import { Toaster } from "react-hot-toast"
import { MutatingDots } from "react-loader-spinner"
import { MyProvider } from "../context/ContractContext"

import firebase from 'firebase/app'
import 'firebase/database'
import { firebaseConfig } from "../constants/firebaseConfig.js"

import Navbar from "../components/Navbar/Navbar"

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [polygonMumbai],
    [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY }), publicProvider()]
)

const projectId = "e2126c812a5444455d0d8a781049a86f"

const { wallets } = getDefaultWallets({
    appName: "web3-DREAM11",
    projectId,
    chains,
})

const demoAppInfo = {
    appName: "web3-DREAM11",
}

const connectors = connectorsForWallets([...wallets])

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
})

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default function MyApp({ Component, pageProps, router }) {
    const { pathname } = router
    const [loading, setLoading] = useState(false);
    const shouldRenderComponent = pathname !== '/'
    const routerApp = useRouter();

    useEffect(() => {
        const handleStart = () => {
            setLoading(true);
        };

        const handleComplete = () => {
            setLoading(false);
        };

        routerApp.events.on('routeChangeStart', handleStart);
        routerApp.events.on('routeChangeComplete', handleComplete);
        routerApp.events.on('routeChangeError', handleComplete);

        return () => {
            routerApp.events.off('routeChangeStart', handleStart);
            routerApp.events.off('routeChangeComplete', handleComplete);
            routerApp.events.off('routeChangeError', handleComplete);
        };
    }, [routerApp]);

    return (
        <MyProvider>
            <div>
                {loading ? (
                    <div className="flex h-screen w-screen justify-center items-center">
                        <MutatingDots
                            height="100"
                            width="100"
                            color="#526D82"
                            secondaryColor="#526D82"
                            radius="12.5"
                            ariaLabel="mutating-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />
                    </div>
                ) : (
                    <WagmiConfig config={wagmiConfig}>
                        <RainbowKitProvider
                            appInfo={demoAppInfo}
                            chains={chains}
                            modalSize="compact"
                        >
                            <Toaster position="top-center" reverseOrder={false} />
                            {shouldRenderComponent ? <Navbar dt={true} /> : <Navbar />}
                            <Component {...pageProps} />
                        </RainbowKitProvider>
                    </WagmiConfig>
                )}
            </div>
        </MyProvider>
    )
}
