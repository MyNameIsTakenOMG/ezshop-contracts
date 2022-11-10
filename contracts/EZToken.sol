// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error EZToken__NotEnoughETH();
error EZToken__NotEthSpent();
error EZToken__withdrawFailed();

contract EZToken is ERC20 {

    address private s_owner;
    mapping (address => uint) private s_ethSpentMapping ;

    event withdrew(
        address indexed owner,
        uint256 totalEth
    );

    constructor() ERC20("EZToken", "EZT") {
        s_owner = msg.sender;
    }

    function mint(address to, uint256 amount) public payable {
        if (msg.value < amount * 0.001 ether) {
            revert EZToken__NotEnoughETH();
        }
        uint256 actualAmount = amount * 1e18;
        _mint(to, actualAmount);
        s_ethSpentMapping[msg.sender] += msg.value;
    }

    function withdraw() public {
        if(s_ethSpentMapping[msg.sender] == 0){
            revert EZToken__NotEthSpent();
        }
        uint256 totalEthSpent = s_ethSpentMapping[msg.sender];
        (bool success,) = msg.sender.call{value:totalEthSpent}("");
        if(!success){
            revert EZToken__withdrawFailed();
        }
        else{
            emit withdrew(msg.sender,totalEthSpent);
        }
    }

    // view
    function getOwner() public view returns(address){
        return s_owner;
    }

    function getCurrentBalance() public view returns(uint256){
        return address(this).balance;
    }

    function getEthSpent(address user) public view returns(uint256){
        return s_ethSpentMapping[user];
    }
}
