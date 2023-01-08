import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import Navbar from "../components/Navbar"

export default function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <NotificationProvider>
                <Navbar />
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
    )
}
