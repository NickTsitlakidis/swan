// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SwanMarketplace is ReentrancyGuard, Ownable  {

    using ERC165Checker for address;
    using Counters for Counters.Counter;

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

    struct TokenListing {
        uint price;
        address tokenContractAddress;
        uint tokenId;
        uint listingId;
        address payable seller;
    }

    address public immutable swanWallet;

    bytes4 private constant INTERFACE_ID_ERC721 = 0x80ac58cd;
    Counters.Counter private listingIds;
    uint private feePercentage;

    /// @notice NftAddress -> Token ID -> Listing item
    mapping(address => mapping(uint256 => TokenListing)) private listings;

    constructor() {
        swanWallet = msg.sender;
        feePercentage = 1;
        listingIds.increment();
    }

    function isTokenListed(address tokenContractAddress, uint tokenId) external view returns (bool) {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        return found.listingId > 0;
    }

    function getFeePercentage() external view returns (uint) {
        return feePercentage;
    }

    function updateFeePercentage(uint newFeePercentage) external onlyOwner {
        require(newFeePercentage > 0, "Fee value should be greater than 0");
        feePercentage = newFeePercentage;
    }

    function createListing(address tokenContractAddress, uint tokenId, uint price) external nonReentrant {
        require(price > 0, "Price must be greater than 0");

        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.listingId == 0, "Token is already listed");


        bool isSupportedNft = tokenContractAddress.supportsERC165() && IERC165(tokenContractAddress).supportsInterface(INTERFACE_ID_ERC721);
        require(isSupportedNft == true, "Contract is currently not supported");

        IERC721 nft = IERC721(tokenContractAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Incorrect owner of token");

        nft.transferFrom(msg.sender, address(this), tokenId);

        listingIds.increment();
        TokenListing memory newListing = TokenListing(
            price,
            tokenContractAddress,
            tokenId,
            listingIds.current(),
            payable(msg.sender)
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

    function buyToken(address tokenContractAddress, uint tokenId) external payable nonReentrant {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.listingId > 0, "Listing does not exist");

        require(found.seller != msg.sender, "You can't buy your own token");
        require(found.price == msg.value, "Price doesn't match");

        IERC721(found.tokenContractAddress).transferFrom(address(this), msg.sender, found.tokenId);

        //todo: use openzeppelin payment splitter here
        uint serviceFee = ((found.price * 2) / 100);
        uint sellerFee = found.price - serviceFee;
        payable(found.seller).transfer(sellerFee);
        payable(swanWallet).transfer(serviceFee);

        delete (listings[tokenContractAddress][tokenId]);

        emit TokenSold(
            found.seller,
            msg.sender,
            found.tokenContractAddress,
            found.tokenId,
            found.price,
            found.listingId
        );
    }

    function cancelListing(address tokenContractAddress, uint tokenId) external nonReentrant {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.listingId > 0, "Listing does not exist");

        require(found.seller == msg.sender, "Incorrect owner of listing");

        IERC721(found.tokenContractAddress).transferFrom(address(this), msg.sender, found.tokenId);
        delete (listings[tokenContractAddress][tokenId]);
        emit ListingCancelled(found.seller, found.tokenContractAddress, found.tokenId, found.listingId);
    }
}
