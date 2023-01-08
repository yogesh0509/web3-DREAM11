# AuctionHouse

In total of 3 solidity files have been created for this project and the tests for the same have been written.

The IdentityNft.sol is a soulbound nft contract that can create nfts of players that are auctioned through the Marketplace.sol contract. Only the owner of the Identity.sol contract can mint these nfts for security reasons.

The AuctionHouse.sol contract is a simple auction contract that enables user to bid and withdraw money. The auction ends and the highest bid amount is transferred.

The Marketplace.sol contract enables user to register as a buyer. Buyer bids to the AuctionHouse contract through this contract and the player being auctioned (which is a nft) will change after regular interval due to chainlink keepers. After all the players have been bought, chainlink client will call an api which will send the player statistics thus determining the winner registrant.

###### This project is a work in progress and only the IdentityNft.sol contract have been deployed.