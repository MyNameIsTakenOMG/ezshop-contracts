const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// 1 EZT = 0.001 ETH
const theRate = 1000

!(developmentChains.includes(network.name))? describe.skip
:describe('EZToken', () => {
    let eztokenContract, deployer

    beforeEach(async()=>{
        deployer = (await getNamedAccounts()).deployer  // just the address not the signer object
        await deployments.fixture('eztoken')
        eztokenContract = await ethers.getContract('EZToken',deployer)
    })

    describe('withdraw', () => {
        let player

        beforeEach(async() => {
            let accounts =await ethers.getSigners()
            player = accounts[1]
            let amount = 100
            const tx = await eztokenContract.mint(deployer, amount,{value:ethers.utils.parseEther(String(amount/theRate))})
            await tx.wait(1)
            let provider = ethers.provider
            let initialBalance = await provider.getBalance(eztokenContract.address)
            // let initialBalance = await eztokenContract.getCurrentBalance()
            console.log('the initial balance: ',initialBalance.toString())
            let deployerBalance = await eztokenContract.balanceOf(deployer)
            console.log('deployer balance: ',deployerBalance.toString());
        })
        it('should revert if the user has not bought token',async()=>{
            const playerConnected = eztokenContract.connect(player)
            await expect(playerConnected.withdraw()).to.be.reverted
        })
        it('should withdraw the eths from the contract if the user already bought some tokens',async()=>{
            await expect(eztokenContract.withdraw()).to.emit(eztokenContract,'withdrew')
            let currentBalance = await eztokenContract.getCurrentBalance()
            console.log('current balance of the contract: ',currentBalance.toNumber());
        })
    })
    
    describe('mint', () => {
        it('should revert if there is not enough eth',async()=>{
            await expect(eztokenContract.mint(deployer,100)).to.be.reverted
        })
        it('should mint 100 tokens',async()=>{
            const oldBalance = await eztokenContract.balanceOf(deployer)
            console.log('the old deployer balance: ',oldBalance.toString());
            const tx = await eztokenContract.mint(deployer,100,{value:ethers.utils.parseEther(String(100/theRate))})
            const txReceipt = await tx.wait(1)
            const newBalance = await eztokenContract.balanceOf(deployer)
            console.log('the new deployer balance: ',newBalance.toString());
            assert.equal(newBalance.toString().slice(0,-18),'100')
        })
    })
})