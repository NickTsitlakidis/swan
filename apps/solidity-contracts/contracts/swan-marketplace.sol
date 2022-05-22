// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SwanMarketplace is ReentrancyGuard {

    enum ListingStatus {LISTED, SOLD, CANCELLED}

    struct TokenListing {
        uint price;
        address tokenContractAddress;
        uint tokenId;
        uint listingId;
        address payable seller;
        ListingStatus status;
    }

    event TokenListed(
        address seller,
        address tokenContractAddress,
        uint tokenId,
        uint price,
        uint listingId
    );

    event TokenSold(
        address seller,
        address buyer,
        address tokenContractAddress,
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

    //todo check if mapping or other structure is cheaper
    TokenListing[] private listings;
    address public immutable swanWallet;
    uint idCounter;
    uint private immutable feePercentage;
    //mapping(uint => TokenListing) public listings;

    constructor() {
        idCounter = 1;
        swanWallet = msg.sender;
        feePercentage = 1;
    }

    function createListing(address tokenContractAddress, uint tokenId, uint price) external nonReentrant {
        require(price > 0, "Price can only be a positive number");
        ERC721(tokenContractAddress).transferFrom(msg.sender, address(this), tokenId);

        int foundAt = - 1;
        for (uint i = 0; i < listings.length; i++) {
            if (listings[i].tokenContractAddress == tokenContractAddress
            && keccak256(abi.encodePacked(tokenId)) == keccak256(abi.encodePacked(listings[i].tokenId))
                && listings[i].status == ListingStatus.LISTED) {
                foundAt = int(i);
            }
        }
        require(foundAt == - 1, "Token is already listed");
        idCounter++;
        TokenListing memory newListing = TokenListing(
            price,
            tokenContractAddress,
            tokenId,
            idCounter,
            payable(msg.sender),
            ListingStatus.LISTED
        );
        listings.push(newListing);

        emit TokenListed(
            newListing.seller,
            newListing.tokenContractAddress,
            newListing.tokenId,
            newListing.price,
            newListing.listingId
        );
    }

    function buyToken(uint listingId) external payable {
        int foundAt = - 1;
        for (uint i = 0; i < listings.length; i++) {
            if (listings[i].listingId == listingId && listings[i].status == ListingStatus.LISTED) {
                foundAt = int(i);
            }
        }
        require(foundAt > - 1, "Listing id does not exist");
        require(listings[uint(foundAt)].seller != msg.sender, "You can't buy your own token");
        require(listings[uint(foundAt)].price == msg.value, "Price doesn't match");

        listings[uint(foundAt)].status = ListingStatus.SOLD;

        ERC721(listings[uint(foundAt)].tokenContractAddress).transferFrom(address(this), msg.sender, listings[uint(foundAt)].tokenId);

        //todo: use openzeppelin payment splitter here
        uint serviceFee = ((listings[uint(foundAt)].price * 2) / 100);
        uint sellerFee = listings[uint(foundAt)].price - serviceFee;
        payable(listings[uint(foundAt)].seller).transfer(sellerFee);
        payable(swanWallet).transfer(serviceFee);

        emit TokenSold(
            listings[uint(foundAt)].seller,
            msg.sender,
            listings[uint(foundAt)].tokenContractAddress,
            listings[uint(foundAt)].tokenId,
            listings[uint(foundAt)].price,
            listings[uint(foundAt)].listingId
        );
    }

    function cancelListing(uint listingId) external {
        int foundAt = - 1;
        for (uint i = 0; i < listings.length; i++) {
            if (listings[i].listingId == listingId && listings[i].status == ListingStatus.LISTED) {
                foundAt = int(i);
            }
        }
        require(foundAt > - 1, "Listing id does not exist");
        require(listings[uint(foundAt)].seller == msg.sender, "You can only cancel your own listings");

        listings[uint(foundAt)].status = ListingStatus.CANCELLED;
        ERC721(listings[uint(foundAt)].tokenContractAddress).transferFrom(address(this), msg.sender, listings[uint(foundAt)].tokenId);

        emit ListingCancelled(
            listings[uint(foundAt)].seller,
            listings[uint(foundAt)].tokenContractAddress,
            listings[uint(foundAt)].tokenId,
            listings[uint(foundAt)].listingId
        );
    }
}