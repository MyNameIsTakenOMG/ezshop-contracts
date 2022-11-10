const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const {verify} = require("./verify")

module.exports = async({deployments, getNamedAccounts})=>{
    const {deployer} = await getNamedAccounts()
    const {deploy, log} = deployments
    const args = []
    log('start deploying -----------------')
    const marketplaceContract = await deploy('EZMarketplace',{
        from:deployer,
        log:true,
        args:args,
        waitConfirmations:network.config.blockConfirmations
    })
    log('finished deploying----------------')
    
    if(!developmentChains.includes(network.name)){
        log('start verifying ------------------------')
        await verify(marketplaceContract.address,args)
        log('finished verifying ------------------------')
    }

}

module.exports.tags = ['all','marketplace']