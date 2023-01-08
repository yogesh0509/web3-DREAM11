# AuctionHouse Marketplace 

At first, users need to register themselves as a participant.
The participant will then have to participate in a series of auctions that will sell players.
These players have already been created as **soulbound NFTs** using another contract.
After all the listed NFTs are sold, the contract will fetch the ranks of these players using any trusted **oracle** (in this project I have used chainlink for the same) from outside the blockchain.
These ranks are created with reference to their actual performance. Players' performance is then added to their team's respective score and the team with the highest score wins.