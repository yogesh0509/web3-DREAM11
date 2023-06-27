import React from "react";

import '../styles/globals.css';
import "@rainbow-me/rainbowkit/styles.css";

import {
    RainbowKitProvider,
    getDefaultWallets,
    connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import { CookiesProvider } from 'react-cookie';
import { useCookies } from 'react-cookie';
import { MutatingDots } from "react-loader-spinner";

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [mainnet, polygon, polygonMumbai],
    [publicProvider()]
);

const projectId = "YOUR_PROJECT_ID";

const { wallets } = getDefaultWallets({
    appName: "web3-DREAM11",
    projectId,
    chains,
});

const demoAppInfo = {
    appName: "web3-DREAM11",
};

const connectors = connectorsForWallets([...wallets]);

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

const ethers = require("ethers")
const ContractAbi = require("../constants/ContractAbi.json")

export default function MyApp({ Component, pageProps }) {

    const [ready, setReady] = React.useState(false);
    React.useEffect(() => {
        setReady(true);
    }, []);

    const [cookies, setCookie] = useCookies(['time']);
    const [cookiesState, setCookieState] = useCookies(['state']);

    let address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
    let abi = JSON.parse(ContractAbi["Marketplace"])
    const provider = new ethers.providers.WebSocketProvider(
        `wss://young-warmhearted-ensemble.matic-testnet.discover.quiknode.pro/${process.env.NEXT_PUBLIC_INFURA_KEY}/`
    );
    const contract = new ethers.Contract(address, abi, provider);

    contract.on("AuctionStarted", (from, to, value, event) => {
        let transferEvent = {
            from: from,
            to: to,
            value: value,
            eventData: event,
        }
        let time = Date.now()
        let flag = false
        setCookie('time', time, { path: '/' })
        setCookieState('state', flag, { path: '/' })
    })

    contract.on("AuctionEnded", (from, to, value, event) => {
        let transferEvent = {
            from: from,
            to: to,
            value: value,
            eventData: event,
        }
        let time = Date.now()
        let flag = true
        setCookie('time', time, { path: '/' })
        setCookieState('state', flag, { path: '/' })

    })

    return (
        <CookiesProvider>
            <div>
                {ready ? (
                    <WagmiConfig config={wagmiConfig}>
                        <RainbowKitProvider
                            appInfo={demoAppInfo}
                            chains={chains}
                            modalSize="compact"
                        >
                            <Toaster position="top-center" reverseOrder={false} />
                            <Component {...pageProps} />
                        </RainbowKitProvider>
                    </WagmiConfig>
                ) : (
                    <div className="flex h-screen w-screen justify-center items-center">
                        <MutatingDots
                            height="100"
                            width="100"
                            color="#48bb78"
                            secondaryColor="#48bb78"
                            radius="12.5"
                            ariaLabel="mutating-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />
                    </div>
                )}
            </div>
        </CookiesProvider>
    )
}
