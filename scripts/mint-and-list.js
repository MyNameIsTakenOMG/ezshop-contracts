const { getNamedAccounts, ethers } = require("hardhat")

const mintAndList = async()=>{
    let deployer = (await getNamedAccounts()).deployer
    let nftContract = await ethers.getContract('EZNft',deployer)
    let marketplaceContract = await ethers.getContract('EZMarketplace',deployer)
    let tokenuri = 'https://exmaple.com'
    let tokenId = await nftContract.getCurrentTokenIdCounter()
    const mintTx = await nftContract.safeMint(deployer, tokenuri)
    await mintTx.wait()
    const approveTx = await nftContract.approve(marketplaceContract.address,tokenId)
    await approveTx.wait()
    const listTx = await marketplaceContract.listItem(nftContract.address,tokenId,BigInt(1e18))
    await listTx.wait()
}

mintAndList()
.then(()=>{
    process.exit(0)
})
.catch((err)=>{
    console.log('err',err)
    process.exit(1)
})