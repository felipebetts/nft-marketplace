// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    // define listing fee price
    uint256 listingPrice = 0.0250 ether; // actually is matic, not ether

    constructor() {
        owner = payable(msg.sender);
    }

    // defining the type struct of our market items 
    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // map the token id to the market item similar to "join"
    mapping(uint256 => MarketItem) private idToMarketItem;

    // create event for when a market item is created
    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // function that return the listing price of an item
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // function for creating a market item for sale
    function createMarketItem (
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), // address of the seller received in the transaction
            payable(address(0)), // owner address is empty (represented by address(0)) because item is listed in the marketplace and has no owner
            price,
            false // not sold
        );

        // transfering ownership of the nft to this contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        // emitting market item created event
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    // function for selling listed item
    function createMarketSale(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;

        require(msg.value == price, "Please submit the asking price in order to complete the pruchase");

        idToMarketItem[itemId].seller.transfer(msg.value); // transfer the value to the seller
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); // transfer token from contract(marketplace) to buyer
        idToMarketItem[itemId].owner = payable(msg.sender); // set buyer as new owner
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice); // transfer listing fee to contract owner (aka marketplace, aka me)
    }

    // function for listing the market items available for sale (not sold)
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        // create empty array ready to receive market items
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        // iterate all items
        for (uint i = 0; i < itemCount; i++) {
            // if item has empty address as owner, this means the item is for sale in the marketplace
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    // function for listing the NFT's the current user has bought
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        // iterate all items
        for (uint i = 0; i < totalItemCount; i++) {
            // if item has msg.sender as owner, this means the item is owned by the current user
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        // iterate all items
        for (uint i = 0; i < totalItemCount; i++) {
            // if item has msg.sender as owner, this means the item is owned by the current user
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }

    // function for listing NFT's the current user has created
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        // iterate all items
        for (uint i = 0; i < totalItemCount; i++) {
            // if item has msg.sender as seller, this means the item has been created or added to the market by the current user
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        // iterate all items
        for (uint i = 0; i < totalItemCount; i++) {
            // if item has msg.sender as owner, this means the item is owned by the current user
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }

        return items;
    }
}