const { getNamedAccounts, ethers } = require("hardhat")

// 1 ez token = 0.001 eth
const RATE = 1000

const test = async()=>{
    let eztokenContract, deployer
    deployer = (await getNamedAccounts()).deployer
    // deployer = accounts[0]
    console.log('deployer address: ',deployer.address);
    eztokenContract = await ethers.getContract('EZToken',deployer)
    // eztokenContract = await ethers.getContractAt('EZToken','0x5FbDB2315678afecb367f032d93F642f64180aa3',deployer)
    const tx = await eztokenContract.mint(deployer,100,{value:ethers.utils.parseEther(String(100/RATE))})
    const txReceipt = await tx.wait(1)
    const events = txReceipt.events
    console.log('event: ',events);
}

test()
.then(()=>{
    process.exit(0)
})
.catch((err)=>{
    console.log(err)
    process.exit(1)
})