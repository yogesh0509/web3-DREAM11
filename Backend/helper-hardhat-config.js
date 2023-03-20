const networkConfig = {
    31337: {
        name: "localhost",
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
        jobId: "31490c88664e49558d7238b960e25c27",
    },
    5: {
        name: "goerli",
        keepersUpdateInterval: "30",
        callbackGasLimit: "600000", // 500,000 gas
        IdentityNftAddress: "0x90F221148797B9344550C68f13F2A6dCA377133e",
        AuctionHouseAddress: "0x03A445C2432e57c3975239DE42544bF887C16930",
        MockOracleAddress: "0x03093d3756ce8CaF65D7ccbd5B252ED9fd49CA60",
        jobId: "31490c88664e49558d7238b960e25c27",
        LinkTokenAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    },
    11155111: {
        name: "sepolia",
        keepersUpdateInterval: "30",
        callbackGasLimit: "600000", // 500,000 gas
        IdentityNftAddress: "0xce1F64f81C1a6679ae67d9218463456f09562007",
        AuctionHouseAddress: "0x0b0aA501E06b6C393ECF8BEe0430F7B4e30b69CE",
        MockOracleAddress: "0x2b6aC48A4e87F2683A0b537E2F1D47e9A864d63d",
        jobId: "698b2800b68b4ec2a0df56c5a9636b01",
        LinkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    }
}

const developmentChains = ['hardhat', 'localhost'];
module.exports = {
    networkConfig,
    developmentChains
}