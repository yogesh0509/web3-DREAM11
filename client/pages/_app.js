import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import { CookiesProvider } from 'react-cookie';
import { useCookies } from 'react-cookie';
import './globals.css';
import Navbar from "../components/Navbar"

const ethers = require("ethers")
const ContractAbi = require("../constants/ContractAbi.json")

export default function MyApp({ Component, pageProps }) {
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
            <MoralisProvider initializeOnMount={false}>
                <NotificationProvider>
                    <Navbar />
                    <Component {...pageProps} />
                </NotificationProvider>
            </MoralisProvider>
        </CookiesProvider>
    )
}
