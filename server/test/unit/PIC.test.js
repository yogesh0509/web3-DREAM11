const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

const tokenUri = "image"
const TOKEN_ID = 0

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("PIC unit tests", () => {
        let PICContract, PIC

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            await deployments.fixture(["PIC"])
            PICContract = await ethers.getContract("PIC")
            PIC = PICContract.connect(accounts[0])

        })

        describe("tests for all functions", () => {
            it("update function", async () => {
                await PIC.updatetokenURI(TOKEN_ID, tokenUri)
                assert.equal((await PIC.imageURI(TOKEN_ID)).toString(), tokenUri)
            })
        })
    })