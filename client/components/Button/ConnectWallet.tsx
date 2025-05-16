import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle } from "lucide-react";

interface ConnectWalletProps {
  wrong_network_btn?: string;
  connect_wallet_btn?: string;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({
  wrong_network_btn = "Wrong Network",
  connect_wallet_btn = "Connect Wallet",
}) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={openConnectModal}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      {connect_wallet_btn}
                    </Button>
                  </motion.div>
                );
              }
              if (chain.unsupported) {
                return (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={openChainModal}
                      variant="destructive"
                      className="px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      {wrong_network_btn}
                    </Button>
                  </motion.div>
                );
              }
              return (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={openAccountModal}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    {account.displayName}
                  </Button>
                </motion.div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWallet;

