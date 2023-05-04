const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

const tokenUri = "ipfs://bafyreiflh4wjd2shgk2kguff5gl5uv6ifpdszfgfep2itve3tdzqugx7mu/metadata.json";
const payment = '3000000000000000000'
const callbackValue = "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004"
const bid = 1e15
const AUCTION_TIME = 900;

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Game unit tests", () => {
        let GameContract, Game, oracleContract,AuctionContract, oracle, linkContract, link, PICContract, PIC, Auction

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            await deployments.fixture(["all"])
            GameContract = await ethers.getContract("Game")
            oracleContract = await ethers.getContract("MockOracle")
            linkContract = await ethers.getContract("LinkToken")
            PICContract = await ethers.getContract("PIC")
            AuctionContract = await ethers.getContract("Auction")

            Game = GameContract.connect(accounts[0])
            oracle = oracleContract.connect(accounts[0])
            link = linkContract.connect(accounts[0])
            PIC = PICContract.connect(accounts[0])
            Auction = AuctionContract.connect(accounts[0])

            await PIC.mintNft(tokenUri);
            await Auction.putGame(Game.address)

        })

        describe("checking constructor", () => {
            it("initial auction state", async () => {
                assert.equal((await Game.s_auctionState()).toString(), "false")
            })

            it("check current player count", async () => {
                // We have minted a nft before deployment of Game contract. 
                // check deploy scripts....
                assert.equal((await Game.s_totalplayerCount()).toString(), "0")
            })
        })

        describe("check when start auction is triggered", () => {

            it("reverts if buyer has not registered", async () => {
                await expect(Game.bid({value: bid})).to.be.revertedWith("BuyerNotRegistered")
            })

            it("reverts if auction has not started", async () => {
                await Game.register()
                await expect(Game.bid({value: bid})).to.be.revertedWith("AuctionHasEnded")
            })

            it("auction will be started if enough time has passed", async () => {

                await network.provider.send("evm_increaseTime", [2*AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                // This will trigger the start auction function.
                await expect(Game.performUpkeep([])).to.emit(Game, "AuctionStarted");
                assert.equal((await Game.s_auctionState()).toString(), "true")
            })
        })

        describe("checkupkeep", () => {

            it("initial start auction upkeepNeeded", async () => {

                await network.provider.send("evm_increaseTime", [2*AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })

                const { upkeepNeeded } = await Game.callStatic.checkUpkeep("0x")
                assert.equal(upkeepNeeded, true)
            })

            it("end auction upkeepNeeded", async () => {

                await network.provider.send("evm_increaseTime", [2 * AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })

                const { upkeepNeeded } = await Game.callStatic.checkUpkeep("0x")
                assert.equal(upkeepNeeded, true)
            })

        })

        describe("auction ended", () => {

            beforeEach(async () => {
                await Game.register()

                await network.provider.send("evm_increaseTime", [2 * AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await Game.bid({ value: bid })

            })

            it("end the auction using chainlink keepers", async () => {
                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await expect(Game.performUpkeep([])).to.emit(Game, "AuctionEnded");

            })

            it("check if the funds have been transferred", async () => {
                assert.equal((await Game.provider.getBalance(Game.address)).toString(), "0")

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])
                assert.equal((await Game.provider.getBalance(Game.address)).toString(), bid)

            })
        })

        describe("get result from chainlink api", () => {
            let tx, txreceipt, requestId;
            beforeEach(async () => {
                await link.transfer(Game.address, payment)

                await Game.register()

                await network.provider.send("evm_increaseTime", [2 * AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                tx = await Game.performUpkeep([])
                txreceipt = await tx.wait(1)
                requestId = txreceipt.events[0].topics[1]

            })

            it("successfully make an api request", async () => {
                expect(requestId).to.not.be.null
            })

            it("Should successfully make an API request and get a result", async () => {
                await expect(oracle.fulfillOracleRequest(requestId, callbackValue)).to.emit(Game, "RequestFulfilled")
            })
        })

        describe("returning variables", () => {

            it("get all buyers", async () => {

                await Game.register()
                assert.equal((await Game.getBuyers()).toString(), accounts[0].address)
            })
            it("no of players purchasd by a registrant", async () => {

                await Game.register()
                await network.provider.send("evm_increaseTime", [2 * AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await Game.bid({ value: bid })

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                assert.equal((await Game.getPlayersPurchased(accounts[0].address)).toString(), 1)
            })
            it("sum spent by a registrant", async () => {

                await Game.register()
                Game = GameContract.connect(accounts[1])
                await Game.register()
                Game = GameContract.connect(accounts[0])

                await network.provider.send("evm_increaseTime", [2 * AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await Game.bid({ value: bid })
                Game = GameContract.connect(accounts[1])
                await Game.bid({ value: bid + 5e14})
                Game = GameContract.connect(accounts[0])
                await Game.bid({ value: bid + 1e15})

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                assert.equal((await Game.moneyspent(accounts[0].address)).toString(), bid+1e15)
            })
            it("return team score and winner", async () => {

                await PIC.mintNft(tokenUri)
                await Game.register()
                await link.transfer(Game.address, payment)

                Game = GameContract.connect(accounts[1])
                await Game.register()
                Game = GameContract.connect(accounts[0])

                await network.provider.send("evm_increaseTime", [2 * AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await Game.bid({ value: bid })

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])


                Game = GameContract.connect(accounts[1])
                await Game.bid({ value: bid })
                Game = GameContract.connect(accounts[0])

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                await Game.performUpkeep([])

                await network.provider.send("evm_increaseTime", [AUCTION_TIME])
                await network.provider.request({ method: "evm_mine", params: [] })
                const tx = await Game.performUpkeep([])
                const txreceipt = await tx.wait(1)
                const requestId = txreceipt.events[0].topics[1]
                await oracle.fulfillOracleRequest(requestId, callbackValue)

                assert.equal((await Game.getTeamScore(accounts[0].address)).toString(), 3)
                assert.equal((await Game.getTeamScore(accounts[1].address)).toString(), 4)
                assert.equal((await Game.getWinner()), accounts[1].address)
            })
        })
    })
