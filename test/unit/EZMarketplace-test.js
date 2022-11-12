const { expect, assert } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip
:describe('EZMarketplace', () => {
    let marketplaceContract, deployer, player, eztokenContract, ezNftContract
    let uri = 'https://exmaple.com'
    let nftPrice = 20  // 20 EZ tokens , actual price is 20 * 1e18 ( with decimals)
    // 1 EZT = 0.001 ETH
    const theRate = 1000
    const theAmount = 100
    let tokenId

    beforeEach(async()=>{
        const accounts = await ethers.getSigners()
        // signer type
        deployer = accounts[0]
        player = accounts[1]
        await deployments.fixture('all')
        marketplaceContract = await ethers.getContract('EZMarketplace',deployer)
        eztokenContract = await ethers.getContract('EZToken',deployer)
        ezNftContract = await ethers.getContract('EZNft',deployer)
        
        // first, get the token id (type: BigNumber) and  mint a nft
        tokenId = await ezNftContract.getCurrentTokenIdCounter()
        await ezNftContract.safeMint(deployer.address, uri)
        // // second, approve the market place to list the item
        // await ezNftContract.approve(marketplaceContract.address,tokenId)
    })

    describe('list item', ()=>{
        it('should revert if the user has not approved the marketplace',async()=>{
            await expect(marketplaceContract.listItem(ezNftContract.address,tokenId,BigInt(nftPrice*1e18))).to.be.reverted
        })
        it('should list the item', async()=>{
            // second, approve the market place to list the item
            await ezNftContract.approve(marketplaceContract.address,tokenId)
            // last, list the item onto the market place
            await expect(marketplaceContract.listItem(ezNftContract.address,tokenId,BigInt(nftPrice*1e18))).to.emit(marketplaceContract,'itemListed')
            const item = await marketplaceContract.getItemInfo(ezNftContract.address,tokenId)
            assert.equal(item.price.toString().slice(0,-18),nftPrice)
            assert.equal(item.seller,deployer.address)
        })
        it('should revert if the nft already listed',async()=>{
            // second, approve the market place to list the item
            await ezNftContract.approve(marketplaceContract.address,tokenId)
            // list the item
            await marketplaceContract.listItem(ezNftContract.address,tokenId,BigInt(nftPrice*1e18))
            await expect(marketplaceContract.listItem(ezNftContract.address,tokenId,BigInt(10*1e18))).to.be.reverted
        })
        it('should revert if the nft price is zero or negative', async()=>{
            // second, approve the market place to list the item
            await ezNftContract.approve(marketplaceContract.address,tokenId)
            await expect(marketplaceContract.listItem(ezNftContract.address,tokenId,0)).to.be.reverted
        })
    })
    describe('update item', () => {
        beforeEach(async()=>{
            // second, approve the market place to list the item
            await ezNftContract.approve(marketplaceContract.address,tokenId)
            await marketplaceContract.listItem(ezNftContract.address,tokenId,nftPrice)
        })
        it('should update the price the the nft', async () => {
            await expect(marketplaceContract.updateItem(ezNftContract.address,tokenId,BigInt(30*1e18))).to.emit(marketplaceContract,'itemListed')
            const item = await marketplaceContract.getItemInfo(ezNftContract.address,tokenId)
            assert.equal(item.price.toString().slice(0,-18),'30')
        })
        it('should revert if the price is zero or negative', async () =>{
            await expect(marketplaceContract.updateItem(ezNftContract.address,tokenId,0)).to.be.reverted
        })
        it('should revert if the user is not the owner of the item', async () =>{
            const playerMarketplaceConnected = marketplaceContract.connect(player)
            await expect(playerMarketplaceConnected.updateItem(ezNftContract.address,tokenId,10)).to.be.reverted
        })
    })
    describe('cancel item',()=>{
        beforeEach(async()=>{
            // second, approve the market place to list the item
            await ezNftContract.approve(marketplaceContract.address,tokenId)
            await marketplaceContract.listItem(ezNftContract.address,tokenId,nftPrice)
        })
        it('should revert if the item is not listed', async () => {
            await expect(marketplaceContract.cancelItem(ezNftContract.address,100000)).to.be.reverted
        })
        it('should cancel the item', async () =>{
            await expect(marketplaceContract.cancelItem(ezNftContract.address,tokenId)).to.emit(marketplaceContract,'itemCancelled')
            await expect(marketplaceContract.getItemInfo(ezNftContract.address,tokenId)).to.be.reverted
        })
    })
    describe('buy item',()=>{
        beforeEach(async()=>{
            // second, approve the market place to list the item
            await ezNftContract.approve(marketplaceContract.address,tokenId)
            await marketplaceContract.listItem(ezNftContract.address,tokenId,BigInt(nftPrice*1e18))
        })
        it('should revert if the user of the owner of the nft', async () => {
            await expect(marketplaceContract.buyItem(eztokenContract.address,ezNftContract.address,tokenId)).to.be.reverted
        })
        it('should revert if the item is not listed', async () => {
            const playerMarketplaceConnected = marketplaceContract.connect(player)
            await expect(playerMarketplaceConnected.buyItem(eztokenContract.address,ezNftContract.address,10000)).to.be.reverted
        })
        it('should revert if there is not enough allowance',async()=>{
            const playerTokenConnected = eztokenContract.connect(player)
            const playerNftConnected = ezNftContract.connect(player)
            const playerMarketplaceConnected = marketplaceContract.connect(player)
            // first, the player buy some ez tokens 
            await playerTokenConnected.mint(player.address,theAmount,{value:ethers.utils.parseEther(String(theAmount/theRate))})
            // second, the player approves the marketplace to have some allowance
            await playerTokenConnected.approve(marketplaceContract.address,BigInt(10*1e18))
            // last, try to buy the item ( reverted cuz not enough allowance)
            await expect(playerMarketplaceConnected.buyItem(eztokenContract.address,ezNftContract.address,tokenId)).to.be.reverted
        })
        it('should buy the item',async()=>{
            const playerTokenConnected = eztokenContract.connect(player)
            const playerNftConnected = ezNftContract.connect(player)
            const playerMarketplaceConnected = marketplaceContract.connect(player)
            // first, the player buy some ez tokens 
            await playerTokenConnected.mint(player.address,theAmount,{value:ethers.utils.parseEther(String(theAmount/theRate))})
            // second, the player approves the marketplace to have some allowance
            await playerTokenConnected.approve(marketplaceContract.address,BigInt(50*1e18))
            let oldAllowance = await playerTokenConnected.allowance(player.address,marketplaceContract.address)
            console.log('old allowance: ',oldAllowance.toString().slice(0,-18));
            // last, the player buys the item
            let tx = await playerMarketplaceConnected.buyItem(eztokenContract.address,ezNftContract.address,tokenId)
            
            // because hardhat registered marketplace contract as event emitter, so it couldn't decode the event
            // emitted from other contracts, so in order to decode those events, we have to use corresponding contracts to 
            // decode them
            // const listener = async ()=>{
            //     return new Promise(resolve=>{
            //         playerTokenConnected.on('Transfer',(from,to,value,event)=>{
            //             console.log('from: ',from);
            //             console.log('to: ',to);
            //             console.log('value: ',value)
            //             console.log('event: ',event)
            //             resolve()
            //         })
            //     }) 
            // }
            // await listener()
            // let txReceipt = await tx.wait(1)
            // let events = txReceipt.events
            // console.log('the number of events received: ' + events.length);
            // for(let event of events){
            //     if(event.address == eztokenContract.address){
            //         const decodedEvent = eztokenContract.interface.parseLog({topics:event.topics,data:event.data})
            //         console.log('Token event -------------------');
            //         console.log('decoded event: ' + Object.keys(decodedEvent));
            //         console.log('decoded event name: ' + decodedEvent.name);
            //         if(decodedEvent.name == 'Approval'){
            //             console.log('decoded event args value: ' + decodedEvent.args.value);
            //         }
            //         console.log('decoded event topic: ' + decodedEvent.topic);
            //         console.log('decoded event eventFragment: ' + decodedEvent.eventFragment);
            //         console.log('decoded event args: ' + decodedEvent.args);
            //         console.log('decoded event signature: ' + decodedEvent.signature);
            //     }
            //     else if(event.address == ezNftContract.address){
            //         const decodedEvent = ezNftContract.interface.parseLog({topics:event.topics,data:event.data})
            //         console.log('Nft event ---------------------');
            //         console.log('decoded event: ',decodedEvent);
            //     }
            //     // else {
            //     //     console.log('market place event --------------------');
            //     //     console.log('event : ', event)
            //     //     console.log('event buyer: ', event.args.buyer)
            //     // }
            // }

            // allowance = 30
            let newAllowance = await playerTokenConnected.allowance(player.address,marketplaceContract.address)
            console.log('new allowance: ',newAllowance.toString().slice(0,-18));

            let playerBalance = await playerTokenConnected.balanceOf(player.address)
            console.log('player balance is: ',playerBalance.toString().slice(0,-18));
            assert.equal(Number(newAllowance.toString().slice(0,-18))+nftPrice, 50)
            
            let deployerBalance = await eztokenContract.balanceOf(deployer.address)
            console.log('deployer balance: ', deployerBalance.toString().slice(0,-18));
            assert.equal(deployerBalance.toString().slice(0,-18),nftPrice)
            
            let nftOwner = await playerNftConnected.ownerOf(tokenId)
            assert.equal(nftOwner,player.address)
            let deployerNftBalance = await ezNftContract.balanceOf(deployer.address)
            let playerNftBalance = await playerNftConnected.balanceOf(player.address)
            assert.equal(deployerNftBalance.toNumber(),0)
            assert.equal(playerNftBalance.toNumber(),1)
            await expect(marketplaceContract.getItemInfo(ezNftContract.address,tokenId)).to.be.reverted
        })
    })
})