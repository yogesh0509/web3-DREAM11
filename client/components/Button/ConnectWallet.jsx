import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

const ConnectWallet = ({
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
                  <button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-[#9DB2BF] to-[#27374D] px-4 py-3 rounded-lg text-white hover:scale-95 transition duration-300"
                    type="button"
                  >
                    {connect_wallet_btn}
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-[#f24343] px-4 py-3 rounded-lg text-white hover:scale-95 transition duration-300"
                  >
                    {wrong_network_btn}
                  </button>
                );
              }
              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-gradient-to-r from-[#9DB2BF] to-[#27374D] px-4 py-3 rounded-lg text-white hover:scale-95 transition duration-300"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWallet;
