const { ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let chainId = network.config.chainId;
    let IdentityNftAddress, AuctionHouseAddress, LinkTokenAddress, MockOracleAddress;

    const jobId = networkConfig[chainId]["jobId"];

    if (developmentChains.includes(network.name)) {

        const IdentityNft = await ethers.getContract("IdentityNft");
        const AuctionHouse = await ethers.getContract("AuctionHouse");
        const linkToken = await ethers.getContract("LinkToken");
        const MockOracle = await ethers.getContract("MockOracle");

        IdentityNftAddress = IdentityNft.address
        AuctionHouseAddress = AuctionHouse.address
        LinkTokenAddress = linkToken.address
        MockOracleAddress = MockOracle.address
    }
    else {
        IdentityNftAddress = networkConfig[chainId]["IdentityNftAddress"];
        AuctionHouseAddress = networkConfig[chainId]["AuctionHouseAddress"];
        MockOracleAddress = networkConfig[chainId]["MockOracleAddress"];
        LinkTokenAddress = networkConfig[chainId]["LinkTokenAddress"];
    }

    const arguments = [IdentityNftAddress, AuctionHouseAddress, MockOracleAddress, jobId, LinkTokenAddress]
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : 6
    const Marketplace = await deploy("Marketplace", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(Marketplace.address, arguments)
    }
}

module.exports.tags = ["all", "marketplace", "main"]
