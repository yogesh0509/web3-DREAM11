import { baseSepolia } from "@wagmi/core/chains"
import { http } from "@wagmi/core";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
    appName: "web3-DREAM11",
    projectId: "e2126c812a5444455d0d8a781049a86f",
    chains: [baseSepolia],
    ssr: true,
    transports: {
        [baseSepolia.id]: http(),
    },
})