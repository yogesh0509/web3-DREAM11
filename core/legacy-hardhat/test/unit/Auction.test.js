const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

const bidAmount = ethers.utils.parseEther("0.1")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("auction unit tests", () => {
        let AuctionContract, Auction

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            await deployments.fixture(["Auction"])
            AuctionContract = await ethers.getContract("Auction")
            Auction = AuctionContract.connect(accounts[0])

        })

        describe("tests for all functions", () => {
            it("bid function", async () => {
                await Auction.bid(accounts[0].address, bidAmount)
            })
        })
    })