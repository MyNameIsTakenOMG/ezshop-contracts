# Welcome to EZshop (smart contracts part)!

## Introduction

This is the smart contracts part of the project **EZshop**.  

**EZshop** is a personal project under development that mimics some functionalities of the website **OpenSea**, from which users can create their own **NFT**s (non fungible tokens) as well as sell and buy them by using the native token **EZ** tokens (EZT)

## Smart Contracts

In the `contracts` folder of the projects, there are three smart contracts file: `EZToken.sol`, `EZNft.sol`, and `EZMarketplace.sol`

- `EZToken.sol` : an `erc20` token smart contract, which extended with two functions: `mint` and `withdraw`. The`mint` function used for minting tokens and  **note** : `withdraw` should only be used for testing purpose and should be removed before being deployed onto any mainnets.
- `EZNft.sol` : an `erc721` nft smart contract, which has an extended function `safeMint`, which used for setting up the `owner` and `tokenUri` properly.
- `EZMarketplace.sol` :  a smart contract used to manage users' nfts, including the prices, the owners. There are several functions that need to be noticed: `listItem`, `updateItem`, `cancelItem`, and `buyItem`.


# Technologies

 - Solidity
 - Openzeppelin
 - Hardhat
 - Ethers.js
 - Chai.js

## Get Started

This is the part showing how to get a local copy up and running. Please follow the steps:

**Prerequisites**

Please make sure **Node.js** has been downloaded and installed globally. The download link:  [Node.js](https://nodejs.org/en/download/)

Also, since the project is using **yarn** instead of **npm**, so please make sure yarn installed globally.
Using the command to install yarn :
```
npm install --global yarn 
```
**Installation**

```
git clone https://github.com/MyNameIsTakenOMG/ezshop-contracts.git
cd ezshop-contracts
yarn
```

**Compile the contracts**

```
yarn hardhat compile
```

**Test the contracts**

```
yarn hardhat test
```

**Testing coverage**

```
yarn hardhat coverage
```

**Deploy the contracts (local hardhat network)**

```
yarn hardhat deploy
```

**Deploy the contracts (Goerli testnet)**

```
yarn hardhat deploy --network goerli
```

**Environment variables**

Please check the `.env.example` file to make sure you have all the environment variables necessary for the project.
- `GOERLI_RPC_URL` :  go to [Alchemy](https://www.alchemy.com/) , sign up for an account, then create an app and check its rpc url by clicking the `view key` tab
- `PRIVATE_KEY` : make sure `Metamask` wallet has been installed in your browser, then select an account, view its detail, and obtain its private key by typing the password.
- `COINMARKETCAP_API_KEY` :  go to [CoinMarketCap](https://coinmarketcap.com/api/), following the instructions to have your api key.
- `ETHERSCAN_API_KEY` :  go to [Etherscan](https://etherscan.io/apis), following the instructions to have your api key.




