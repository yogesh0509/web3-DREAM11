const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const player = [{
        imageURI: "ipfs://bafybeif4uof2j5n3z33sifjaiwzpkhyqwenyohhgk5bexv2mbiasl5q3au",
        name: "virat kohli",
        role: "batsman",
        id: 1413
    },
    {
        imageURI: "ipfs://bafybeigi74wsib47dtnugxpczxospxhflxztcyubq3ifibdkpvxxbkbc2y",
        name: "rohit sharma",
        role: "batsman",
        id: 576
    },
    {
        imageURI: "ipfs://bafybeiegaabgbszh7fqrylhptbimtjlfpj5gkrqnkksq2p6bljnsxhhzlm",
        name: "trent boult",
        role: "bowler",
        id: 8117
    },
    {
        imageURI: "ipfs://bafybeihswxtsfdrsusdnw4lrfnldrcohbmps2nvix4lq4iqxsb2zontnmy",
        name: "steve smith",
        role: "batsman",
        id: 2250
    }
    ]

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
        await verify("0x93ebef26658fB8a8e11A6175E7D45F8aE262Ed3F", arguments)
    }
}

module.exports.tags = ["all", "PIC", "unit"]
