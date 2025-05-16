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
        MockOracleAddress: "0x03093d3756ce8CaF65D7ccbd5B252ED9fd49CA60",
        jobId: "31490c88664e49558d7238b960e25c27",
        LinkTokenAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    },
    11155111: {
        name: "sepolia",
        keepersUpdateInterval: "30",
        callbackGasLimit: "600000", // 500,000 gas
        MockOracleAddress: "0x2b6aC48A4e87F2683A0b537E2F1D47e9A864d63d",
        jobId: "698b2800b68b4ec2a0df56c5a9636b01",
        LinkTokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    },
    80001: {
        name: "mumbai",
        keepersUpdateInterval: "30",
        callbackGasLimit: "600000", // 500,000 gas
        MockOracleAddress: "0x9774be70A8f50b88A44e4C2C83E14C5a43364A6f",
        jobId: "a246d7dda73841818fbd401d7d6e380c",
        LinkTokenAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    }
}

const developmentChains = ['hardhat', 'localhost'];
module.exports = {
    networkConfig,
    developmentChains
}