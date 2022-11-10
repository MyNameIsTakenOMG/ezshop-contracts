const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const {verify} = require("../utils/verify")

module.exports = async ({deployments, getNamedAccounts})=>{
    const {deployer} = await getNamedAccounts()
    const {deploy, log} = deployments
    const args = []
    log('start deploying-------------')
    const EZTokenContract = await deploy('EZToken',{
        from:deployer,
        log:true,
        args:args,
        waitConfirmations: network.config.blockConfirmations 
    })
    // if contract deployed to testnet or mainnet, then verify the contract
    if(!developmentChains.includes(network.name)){
        log('start verifying the contract--------------')
        await verify(EZTokenContract.address,args)
        log('finished verifying the contract--------------')
    }
    log('finished deploying----------------')
}

module.exports.tags = ['all','eztoken']