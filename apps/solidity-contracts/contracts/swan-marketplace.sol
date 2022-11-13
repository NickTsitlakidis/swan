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
        address indexed seller,
        address indexed tokenContractAddress,
        uint indexed tokenId,
        uint price,
        uint listingId);

    event ListingUpdated(
        uint indexed listingId,
        address indexed seller,
        address tokenContractAddress,
        uint tokenId,
        uint currentPrice,
        uint previousPrice
    );

    event TokenSold(
        uint indexed listingId,
        address indexed seller,
        address indexed buyer,
        address tokenContractAddress,
        uint tokenId,
        uint price
    );

    event ListingCancelled(
        uint indexed listingId,
        address indexed seller,
        address tokenAddress,
        uint tokenId
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

    modifier listedToken(
        address tokenContractAddress,
        uint256 tokenId
    ) {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.listingId > 0, "Listing does not exist");
        _;
    }

    function isTokenListed(address tokenContractAddress, uint tokenId) external view returns (bool) {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        return found.listingId > 0;
    }

    function getListing(address tokenContractAddress, uint tokenId) external view returns (TokenListing memory) {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        return found;
    }

    function getFeePercentage() external view returns (uint) {
        return feePercentage;
    }

    function updateFeePercentage(uint newFeePercentage) external onlyOwner {
        require(newFeePercentage > 0, "Fee value should be greater than 0");
        feePercentage = newFeePercentage;
    }

    function filterForInvalid(TokenListing[] memory toFilter) external view returns (uint[] memory) {
        uint[] memory invalid = new uint[](toFilter.length);
        for(uint i=0; i<toFilter.length; i++) {
            IERC721 nft = IERC721(toFilter[i].tokenContractAddress);
            if(nft.ownerOf(toFilter[i].tokenId) != toFilter[i].seller || nft.getApproved(toFilter[i].tokenId) != address(this)) {
                invalid[i] = toFilter[i].listingId;
            }
        }
        return invalid;
    }

    function createListing(address tokenContractAddress, uint tokenId, uint price) external nonReentrant {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.listingId == 0, "Token is already listed");

        bool isSupportedNft = tokenContractAddress.supportsERC165() && IERC165(tokenContractAddress).supportsInterface(INTERFACE_ID_ERC721);
        require(isSupportedNft == true, "Contract is currently not supported");

        IERC721 nft = IERC721(tokenContractAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Incorrect owner of token");

        require(nft.getApproved(tokenId) == address(this), "Token is not approved for transfer");

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

    function updateListingPrice(address tokenContractAddress, uint tokenId, uint newPrice) external listedToken(tokenContractAddress, tokenId) nonReentrant {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.seller == msg.sender, "Sender is not the owner of listing");


        uint previousPrice = found.price;

        listings[tokenContractAddress][tokenId].price = newPrice; //todo

        emit ListingUpdated(
            found.listingId,
            found.seller,
            found.tokenContractAddress,
            found.tokenId,
            newPrice,
            previousPrice
        );

    }

    function buyToken(address tokenContractAddress, uint tokenId) external payable listedToken(tokenContractAddress, tokenId) nonReentrant {
        TokenListing memory found = listings[tokenContractAddress][tokenId];

        require(found.seller != msg.sender, "Token is listed by the buyer");
        require(found.price == msg.value, "Price doesn't match");

        IERC721 nft = IERC721(tokenContractAddress);
        require(nft.ownerOf(tokenId) == found.seller, "Incorrect owner of token");

        require(nft.getApproved(tokenId) == address(this), "Token is not approved for transfer");

        //todo: use openzeppelin payment splitter here
        uint swanFee = ((found.price * feePercentage) / 100);
        uint sellerFee = found.price - swanFee;

        payable(found.seller).transfer(sellerFee);
        payable(swanWallet).transfer(swanFee);

        IERC721(found.tokenContractAddress).safeTransferFrom(found.seller, msg.sender, found.tokenId);

        delete (listings[tokenContractAddress][tokenId]);

        emit TokenSold(
            found.listingId,
            found.seller,
            msg.sender,
            found.tokenContractAddress,
            found.tokenId,
            found.price
        );
    }

    function cancelListing(address tokenContractAddress, uint tokenId) external listedToken(tokenContractAddress, tokenId) nonReentrant {
        TokenListing memory found = listings[tokenContractAddress][tokenId];

        require(found.seller == msg.sender, "Incorrect owner of listing");

        delete (listings[tokenContractAddress][tokenId]);
        emit ListingCancelled(found.listingId, found.seller, found.tokenContractAddress, found.tokenId);
    }
}
