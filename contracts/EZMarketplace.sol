// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error EZMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error EZMarketplace__PriceMustBeGreaterThanZero();
error EZMarketplace__NftNotApproved();
error EZMarketplace__NotTheOwner();
error EZMarketplace__NotListed();
error EZMarketplace__NotEnoughAllowance();
error EZMarketplace__OwnerOfTheNFT();

contract EZMarketplace is ReentrancyGuard {
    struct Item {
        uint256 price;
        address seller;
    }

    event itemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event itemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event itemPurchased(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    // nft address ==> token id ==> item: Item
    mapping(address => mapping(uint256 => Item)) private s_nftAndUserMapping;

    modifier notListed(address nftAddress, uint256 tokenId) {
        if (s_nftAndUserMapping[nftAddress][tokenId].price > 0) {
            revert EZMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        IERC721 nft = IERC721(nftAddress);
        if (nft.ownerOf(tokenId) != owner) {
            revert EZMarketplace__NotTheOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Item memory item = s_nftAndUserMapping[nftAddress][tokenId];
        if (item.price <= 0) {
            revert EZMarketplace__NotListed();
        }
        _;
    }

    constructor() {}

    // 1. list items with price
    // 2. update price for the item
    // 3. cancel the item
    // 4. buy the item

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert EZMarketplace__PriceMustBeGreaterThanZero();
        }
        // check if the seller already approved the marketplace
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert EZMarketplace__NftNotApproved();
        }
        // register the item onto the marketplace
        s_nftAndUserMapping[nftAddress][tokenId] = Item(price, msg.sender);
        // emit listing event
        emit itemListed(msg.sender, nftAddress, tokenId, price);
    }

    function updateItem(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        if (newPrice <= 0) {
            revert EZMarketplace__PriceMustBeGreaterThanZero();
        }
        s_nftAndUserMapping[nftAddress][tokenId].price = newPrice;
        // emit updating event
        emit itemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function cancelItem(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete s_nftAndUserMapping[nftAddress][tokenId];
        // emit cancelling event
        emit itemCancelled(msg.sender, nftAddress, tokenId);
    }

    function buyItem(
        address tokenAddress,
        address nftAddress,
        uint256 tokenId
    ) external isListed(nftAddress, tokenId) nonReentrant {
        IERC20 token = IERC20(tokenAddress);
        IERC721 nft = IERC721(nftAddress);
        // check if the buyer has approved the marketplace and has enough allowance
        uint256 remainingAllowance = token.allowance(msg.sender, address(this));
        uint256 nftPrice = s_nftAndUserMapping[nftAddress][tokenId].price;
        address seller = s_nftAndUserMapping[nftAddress][tokenId].seller;
        // check if the buyer is the owner of the nft, revert if yes
        if(seller == msg.sender){
            revert EZMarketplace__OwnerOfTheNFT();
        }
        // check if there is not enough allowance
        if (remainingAllowance < nftPrice) {
            revert EZMarketplace__NotEnoughAllowance();
        }

        // remove the item from the list
        delete s_nftAndUserMapping[nftAddress][tokenId];
        // transfer tokens to the seller
        token.transferFrom(msg.sender, seller, nftPrice);
        // transfer the nft to the buyer
        nft.safeTransferFrom(seller, msg.sender, tokenId);

        // emit purchasing event
        emit itemPurchased(msg.sender, nftAddress, tokenId, nftPrice);
    }

    // view / pure
    function getItemInfo(address nftAddress, uint256 tokenId) public view returns(Item memory){
        Item memory item = s_nftAndUserMapping[nftAddress][tokenId];
        if(item.price <=0) {
            revert EZMarketplace__NotListed();
        } 
        else{
            return s_nftAndUserMapping[nftAddress][tokenId];
        }
    }
}
