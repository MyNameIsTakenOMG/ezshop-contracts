const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)?describe.skip
:describe('EZNft', () => {
    let eznftContract, deployer

    beforeEach(async()=>{
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture('eznft')
        eznftContract = await ethers.getContract('EZNft',deployer)
    })

    describe('safeMint',()=>{
        it('should successfully mint a nft',async()=>{
            const uri = 'https://exmaple.com'
            let oldCounter = await eznftContract.getCurrentTokenIdCounter()
            oldCounter = oldCounter.toNumber()
            console.log('old counter: ',oldCounter);
            await eznftContract.safeMint(deployer,uri)
            let newCounter = await eznftContract.getCurrentTokenIdCounter()
            newCounter = newCounter.toNumber()
            console.log('new counter: ',newCounter);
            const theUri = await eznftContract.tokenURI(oldCounter)
            const owner = await eznftContract.ownerOf(oldCounter)
            assert.equal(oldCounter+1,newCounter)
            assert.equal(theUri,uri)
            assert.equal(owner,deployer)
        })
        it('should burn the nft',async()=>{
            const uri = 'https://exmaple.com'
            let counter = await eznftContract.getCurrentTokenIdCounter()
            counter = counter.toNumber()
            console.log('counter: ',counter);
            await eznftContract.safeMint(deployer,uri)
            await eznftContract.burn(counter)
            await expect(eznftContract.tokenURI(counter)).to.be.reverted
        })
    })
})