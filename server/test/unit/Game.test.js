const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

const tokenUri = "ipfs://bafyreiflh4wjd2shgk2kguff5gl5uv6ifpdszfgfep2itve3tdzqugx7mu/metadata.json";
const AUCTION_TIME = 300;
const Wrongbid = ethers.utils.parseEther("0.01")
const bid = ethers.utils.parseEther("0.1")
const payment = ethers.utils.parseEther("3")
const callbackValue = "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000004"


!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Game unit tests", () => {
        let GameContract, Game, oracleContract, AuctionContract, oracle, linkContract, link, PICContract, PIC, Auction

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            await deployments.fixture(["all"])
            GameContract = await ethers.getContract("Game")
            oracleContract = await ethers.getContract("MockOracle")
            linkContract = await ethers.getContract("LinkToken")
            PICContract = await ethers.getContract("PIC")

            Game = GameContract.connect(accounts[0])
            oracle = oracleContract.connect(accounts[0])
            link = linkContract.connect(accounts[0])
            PIC = PICContract.attach(await Game.getPICContract())
            await PIC.mintPlayer(tokenUri, "batsman", 1);
        })

        async function waitTimeToStartAuction() {
            await network.provider.send("evm_increaseTime", [2 * AUCTION_TIME])
            await network.provider.request({ method: "evm_mine", params: [] })
        }

        async function waitTimeInterval() {
            await network.provider.send("evm_increaseTime", [AUCTION_TIME])
            await network.provider.request({ method: "evm_mine", params: [] })
        }

        describe("contract deployment", () => {
            it("initial auction state", async () => {
                assert.equal((await Game.s_auctionState()).toString(), "false")
            })

            it("check current player count", async () => {
                assert.equal((await Game.s_totalplayerCount()).toString(), "0")
            })
        })

        describe("tests for register function", () => {
            it("auction is open", async () => {
                await waitTimeToStartAuction()
                await Game.performUpkeep([])
                await expect(Game.register()).to.be.revertedWith("AuctionIsOpen")
            })

            it("incorrect eth amount", async () => {
                await expect(Game.register({value: Wrongbid})).to.be.revertedWith("IncorrectRegistrationAmount")
            })

            it("user registration success", async () => {
                await expect(Game.register({value: bid})).to.emit(Game, "BuyerRegistered")
            })

            it("buyer already registered", async () => {
                await Game.register({value: bid})
                await expect(Game.register({value: bid})).to.be.revertedWith("BuyerAlreadyRegistered")
            })
        })

        describe("tests for bid function", () => {
            it("bidder has not registered", async () => {
                await expect(Game.bid()).to.be.revertedWith("BidderNotRegistered")
            })

            it("auction has not started", async () => {
                await Game.register({value: bid})
                await expect(Game.bid()).to.be.revertedWith("AuctionIsClosed")
            })

            it("bid success", async () => {
                await Game.register({value: bid})
                await waitTimeToStartAuction()
                await Game.performUpkeep([])
                await expect(Game.bid()).to.emit(Game, "PlayerBid")
            })
        })

        describe("tests for checkUpkeep function", () => {
            it("upkeepNeeded is true for toggle auction", async () => {

                await waitTimeToStartAuction()
                const { upkeepNeeded } = await Game.callStatic.checkUpkeep("0x")
                assert.equal(upkeepNeeded, true)
            })

            it("upkeepNeeded is false when all the players have been auctioned", async () => {

                await waitTimeToStartAuction()
                await Game.performUpkeep([])
                await waitTimeInterval()
                await Game.performUpkeep([])

                const { upkeepNeeded } = await Game.callStatic.checkUpkeep("0x")
                assert.equal(upkeepNeeded, false)
            })
        })

        describe("tests for performUpkeep function", () => {

            it("auction started", async () => {
                await waitTimeToStartAuction()
                await expect(Game.performUpkeep([])).to.emit(Game, "AuctionStarted")
            })

            it("auction ended", async () => {
                await Game.register({value: bid})
                Game = GameContract.connect(accounts[1])
                await Game.register({value: bid})
                Game = GameContract.connect(accounts[0])

                await waitTimeToStartAuction()
                await Game.performUpkeep([])

                await Game.bid()
                Game = GameContract.connect(accounts[1])
                await Game.bid()
                Game = GameContract.connect(accounts[0])

                await waitTimeInterval()
                await expect(Game.performUpkeep([])).to.emit(Game, "AuctionEnded")
                assert.equal((await Game.moneyspent(accounts[1].address)).toString(), "3")
                assert.equal((await Game.moneyspent(accounts[0].address)).toString(), "0")

                console.log(await Game.fetchPlayers(accounts[1].address))
            })

            it("all the players have been sold (return data from chainlink api)", async () => {
                let tx, txreceipt, requestId;
                await link.transfer(Game.address, payment)

                await Game.register({value: bid})

                await waitTimeToStartAuction()
                await Game.performUpkeep([])

                await waitTimeInterval()
                await Game.performUpkeep([])

                await waitTimeInterval()
                tx = await Game.performUpkeep([])
                txreceipt = await tx.wait(1)
                requestId = txreceipt.events[0].topics[1]

                expect(requestId).to.not.be.null
                await expect(oracle.fulfillOracleRequest(requestId, callbackValue)).to.emit(Game, "RequestFulfilled")
            })
        })
    })
