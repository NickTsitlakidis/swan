// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./erc-721-token.sol";

contract Swan {

    enum ListingStatus {LISTED, SOLD, CANCELLED}

    struct TokenListing {
        uint price;
        address tokenAddress;
        uint tokenId;
        uint listingId;
        address seller;
        ListingStatus status;
    }

    event TokenListed(
        address seller,
        address tokenAddress,
        uint tokenId,
        uint price,
        uint listingId
    );

    event TokenSold(
        address seller,
        address buyer,
        address tokenAddress,
        uint tokenId,
        uint price,
        uint listingId
    );

    event ListingCancelled(
        address seller,
        address tokenAddress,
        uint tokenId,
        uint listingId
    );


    TokenListing[] private listings;
    address private swanWallet;
    uint idCounter;

    constructor() {
        idCounter = 1;
        swanWallet = msg.sender;
    }

    function getSwanWallet() public returns(address) {
        return swanWallet;
    }

    function createTokenListing(address tokenAddress, uint tokenId, uint price) public {
        ERC721Token(tokenAddress).transferFrom(msg.sender, address(this), tokenId);

        int foundAt = -1;
        for (uint i = 0; i < listings.length; i++) {
            if (listings[i].tokenAddress == tokenAddress
            && keccak256(abi.encodePacked(tokenId)) == keccak256(abi.encodePacked(listings[i].tokenId))
                && listings[i].status == ListingStatus.LISTED) {
                foundAt = int(i);
            }
        }
        require(foundAt == - 1, "Token is already listed");
        idCounter++;
        TokenListing memory newListing = TokenListing(price, tokenAddress, tokenId, idCounter, msg.sender, ListingStatus.LISTED);
        listings.push(newListing);

        emit TokenListed(newListing.seller, newListing.tokenAddress, newListing.tokenId, newListing.price, newListing.listingId);
    }

    function buyToken(uint listingId) public payable {
        int foundAt = -1;
        for (uint i = 0; i < listings.length; i++) {
            if (listings[i].listingId == listingId && listings[i].status == ListingStatus.LISTED) {
                foundAt = int(i);
            }
        }
        require(foundAt > -1, "Listing id does not exist");
        require(listings[uint(foundAt)].seller != msg.sender, "You can't buy your own token");
        require(listings[uint(foundAt)].price == msg.value, "Price doesn't match");

        listings[uint(foundAt)].status = ListingStatus.SOLD;

        ERC721Token(listings[uint(foundAt)].tokenAddress).transferFrom(address(this), msg.sender, listings[uint(foundAt)].tokenId);

        uint serviceFee = ((listings[uint(foundAt)].price * 2) / 100);
        uint sellerFee = listings[uint(foundAt)].price - serviceFee;
        payable(listings[uint(foundAt)].seller).transfer(sellerFee);
        payable(swanWallet).transfer(serviceFee);
        emit TokenSold(listings[uint(foundAt)].seller, msg.sender, listings[uint(foundAt)].tokenAddress, listings[uint(foundAt)].tokenId, listings[uint(foundAt)].price, listings[uint(foundAt)].listingId);
    }

    function cancelListing(uint listingId) public {
        int foundAt = -1;
        for (uint i = 0; i < listings.length; i++) {
            if (listings[i].listingId == listingId && listings[i].status == ListingStatus.LISTED) {
                foundAt = int(i);
            }
        }
        require(foundAt > -1, "Listing id does not exist");
        require(listings[uint(foundAt)].seller == msg.sender, "You can only cancel your own listings");

        listings[uint(foundAt)].status = ListingStatus.CANCELLED;
        ERC721Token(listings[uint(foundAt)].tokenAddress).transferFrom(address(this), msg.sender, listings[uint(foundAt)].tokenId);

        emit ListingCancelled(listings[uint(foundAt)].seller, listings[uint(foundAt)].tokenAddress, listings[uint(foundAt)].tokenId, listings[uint(foundAt)].listingId);
    }
}