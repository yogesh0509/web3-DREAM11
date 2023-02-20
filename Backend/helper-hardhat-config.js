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
    }
}

const developmentChains = ['hardhat', 'localhost'];
module.exports = {
    networkConfig,
    developmentChains
}