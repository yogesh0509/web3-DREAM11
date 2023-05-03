const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

const tokenUri = "ipfs://bafyreiflh4wjd2shgk2kguff5gl5uv6ifpdszfgfep2itve3tdzqugx7mu/metadata.json";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("identity nft unit tests", () => {
        let PICContract, PIC
        const TOKEN_ID = 0

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            await deployments.fixture(["all"])
            PICContract = await ethers.getContract("PIC")
            PIC = PICContract.connect(accounts[0])
            await PIC.mintNft(tokenUri);

        })

        describe("token uri", () => {
            it("check token uri", async () => {
                assert.equal((await PIC.tokenURI(0)).toString(), tokenUri)
            })
        })

        describe("erase nft of a tokenId", () => {
            it("check owner of tokenId", async () => {
                PIC = PICContract.connect(accounts[1])
                await expect(PIC.burn(0)).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it("burn nft", async () => {
                await expect(PIC.burn(0)).to.emit(PIC, "Revoke")
            })

        })

        describe("disable token transfer", () => {
            it("check for error message", async () => {
                await expect(PIC.transferFrom(accounts[0].address, accounts[2].address, 0))
                    .to.be.revertedWith("Not allowed to transfer token")
            })
        })
    })