const { run } = require("hardhat");

const verify = async (contractAddress,args)=>{
    try {
        await run("verify:verify",{
            address:contractAddress,
            constructorArguments:args
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {verify}