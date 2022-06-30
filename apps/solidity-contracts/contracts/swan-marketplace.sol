// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

contract SwanMarketplace is ReentrancyGuard {

    using ERC165Checker for address;
    enum ListingStatus {DEFAULT, LISTED, SOLD, CANCELLED}

    struct TokenListing {
        uint price;
        address tokenContractAddress;
        uint tokenId;
        uint listingId;
        address payable seller;
        ListingStatus status;
    }

    event ListingCreated(
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

    address public immutable swanWallet;
    uint idCounter;
    uint public immutable feePercentage;

    /// @notice NftAddress -> Token ID -> Listing item
    mapping(address => mapping(uint256 => TokenListing)) private listings;
    bytes4 private constant INTERFACE_ID_ERC721 = 0x80ac58cd;

    constructor() {
        idCounter = 1;
        swanWallet = msg.sender;
        feePercentage = 1;
    }

    function createListing(address tokenContractAddress, uint tokenId, uint price) external nonReentrant {
        require(price > 0, "Price must be greater than 0");

        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.status == ListingStatus.DEFAULT, "Token is already listed");


        bool isSupportedNft = tokenContractAddress.supportsERC165() && IERC165(tokenContractAddress).supportsInterface(INTERFACE_ID_ERC721);
        require(isSupportedNft == true, "Contract is currently not supported");

        IERC721 nft = IERC721(tokenContractAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Incorrect owner of token");

        nft.transferFrom(msg.sender, address(this), tokenId);

        idCounter++;
        TokenListing memory newListing = TokenListing(
            price,
            tokenContractAddress,
            tokenId,
            idCounter,
            payable(msg.sender),
            ListingStatus.LISTED
        );
        listings[tokenContractAddress][tokenId] = newListing;

        emit ListingCreated(
            newListing.seller,
            newListing.tokenContractAddress,
            newListing.tokenId,
            newListing.price,
            newListing.listingId
        );
    }

    function buyToken(address tokenContractAddress, uint tokenId) external payable {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.status == ListingStatus.LISTED, "Listing does not exist");

        require(found.seller != msg.sender, "You can't buy your own token");
        require(found.price == msg.value, "Price doesn't match");

        found.status = ListingStatus.SOLD;

        IERC721(found.tokenContractAddress).transferFrom(address(this), msg.sender, found.tokenId);

        //todo: use openzeppelin payment splitter here
        uint serviceFee = ((found.price * 2) / 100);
        uint sellerFee = found.price - serviceFee;
        payable(found.seller).transfer(sellerFee);
        payable(swanWallet).transfer(serviceFee);

        emit TokenSold(
            found.seller,
            msg.sender,
            found.tokenContractAddress,
            found.tokenId,
            found.price,
            found.listingId
        );
    }

    function cancelListing(address tokenContractAddress, uint tokenId) external {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.status == ListingStatus.LISTED, "Listing does not exist");

        require(found.seller == msg.sender, "Invalid listing owner");

        found.status = ListingStatus.CANCELLED;
        IERC721(found.tokenContractAddress).transferFrom(address(this), msg.sender, found.tokenId);

        emit ListingCancelled(found.seller, found.tokenContractAddress,found.tokenId,found.listingId);
    }
}
