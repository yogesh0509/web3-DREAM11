const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const player = [{
        imageURI: "",
        role: "",
        id: 0
    },
    {
        imageURI: "",
        role: "",
        id: 1
    }]

    const arguments = [player]
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : 6
    const PIC = await deploy("PIC", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(PIC.address, arguments)
    }
}

module.exports.tags = ["all", "PIC", "unit"]
