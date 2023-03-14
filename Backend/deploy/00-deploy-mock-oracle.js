const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const LINK_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : 6
    const linkToken = await deploy("LinkToken", {
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations
    })
    const arguments = [linkToken.address]

    const Oracle = await deploy("MockOracle", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(linkToken.address)
        await verify(Oracle.address, arguments)
    }
}

module.exports.tags = ["all", "mock_oracle"]
