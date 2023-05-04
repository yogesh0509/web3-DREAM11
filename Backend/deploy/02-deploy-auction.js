const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const AUCTION_TIME = 300;

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const arguments = [AUCTION_TIME]
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : 6
    const Auction = await deploy("Auction", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(Auction.address, arguments)
    }
}

module.exports.tags = ["all", "Auction", "main"]
