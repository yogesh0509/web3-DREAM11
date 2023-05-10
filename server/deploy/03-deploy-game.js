const { ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const AUCTION_TIME = 300;

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let chainId = network.config.chainId;
    console.log(chainId)
    let PICAddress, AuctionAddress, LinkTokenAddress, MockOracleAddress;

    const jobId = networkConfig[chainId]["jobId"];

    if (developmentChains.includes(network.name)) {
        
        const linkToken = await ethers.getContract("LinkToken");
        const MockOracle = await ethers.getContract("MockOracle");

        LinkTokenAddress = linkToken.address
        MockOracleAddress = MockOracle.address
    }
    else {
        MockOracleAddress = networkConfig[chainId]["MockOracleAddress"];
        LinkTokenAddress = networkConfig[chainId]["LinkTokenAddress"];
    }

    const arguments = [AUCTION_TIME, MockOracleAddress, jobId, LinkTokenAddress]
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : 6
    const Game = await deploy("Game", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(Game.address, arguments)
    }
}

module.exports.tags = ["all", "Game", "master"]
