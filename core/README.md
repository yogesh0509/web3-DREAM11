## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

```shell
# Deploy and verify using foundry

# GAME_FACTORY -> 0xc8C23F4DcC2f3053C53862335970728D91154Df7
$ forge script ./script/GameFactory.s.sol:DeployGameFactory -vvvv --broadcast --rpc-url https://base-sepolia.g.alchemy.com/v2/-rWU61cBUlLTu3wDqYfP9qvAoZErhcuh --sig "run()" --legacy --etherscan-api-key 26RASBPDQ83JTHXCXU46TCY7MRZH1IQ2C3 --verify

# GAME -> 0x5d8D13e67ee77a7a9906CF9223B3C27feB79A356
forge script ./script/Game.s.sol:DeployGame -vvvv --broadcast --rpc-url https://base-sepolia.g.alchemy.com/v2/-rWU61cBUlLTu3wDqYfP9qvAoZErhcuh --legacy --sig "run(address)" -- 0xc8C23F4DcC2f3053C53862335970728D91154Df7 --etherscan-api-key 26RASBPDQ83JTHXCXU46TCY7MRZH1IQ2C3 --verify

# CREATE GAME -> 0x5d8D13e67ee77a7a9906CF9223B3C27feB79A356
forge script ./script/GameFactory.s.sol:DeployGameFactory -vvvv --broadcast --rpc-url https://base-sepolia.g.alchemy.com/v2/-rWU61cBUlLTu3wDqYfP9qvAoZErhcuh --legacy --sig "startGame(address,uint256)" -- 0x5d8D13e67ee77a7a9906CF9223B3C27feB79A356 36000
```
