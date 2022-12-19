// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
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

    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 private constant _INTERFACE_ID_IERC721ENUMERABLE = 0x780e9d63;
    bytes4 private constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;
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
        for(uint i = 0; i < toFilter.length; i++) {
            bool isERC721 = isIERC721(toFilter[i].tokenContractAddress);
            bool isERC1155 = isIERC1155(toFilter[i].tokenContractAddress);
            if (isERC721 == true) {
                (bool wasFound) = isValidERC721Listing(toFilter[i]);
                if (wasFound == true) {
                    invalid[i] = toFilter[i].listingId;
                }
            } else if (isERC1155 == true) {
                (bool wasFound) = isValidERC1155Listing(toFilter[i]);
                if (wasFound == true) {
                    invalid[i] = toFilter[i].listingId;
                }
            }
        }
        return invalid;
    }

    function createListing(address tokenContractAddress, uint tokenId, uint price) external nonReentrant {
        TokenListing memory found = listings[tokenContractAddress][tokenId];
        require(found.listingId == 0, "Token is already listed");

        bool isERC721 = isIERC721(tokenContractAddress);
        bool isERC1155 = isIERC1155(tokenContractAddress);
        require(isERC721 == true || isERC1155 == true, "Contract is currently not supported");
        if (isERC721 == true) {
            IERC721 nft = IERC721(tokenContractAddress);
            checkValidityOfIERC721(nft, tokenId, msg.sender);
        } else if (isERC1155 == true) {
            IERC1155 nft = IERC1155(tokenContractAddress);
            checkValidityOfIERC1155(nft, tokenId, msg.sender);
        }

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

        bool isERC721 = isIERC721(tokenContractAddress);
        bool isERC1155 = isIERC1155(tokenContractAddress);
        if (isERC721 == true) {
            IERC721 nft = IERC721(tokenContractAddress);
            checkValidityOfIERC721(nft, tokenId, found.seller);
        } else if (isERC1155 == true) {
            IERC1155 nft = IERC1155(tokenContractAddress);
            checkValidityOfIERC1155(nft, tokenId, found.seller);
        }

        //todo: use openzeppelin payment splitter here
        uint swanFee = ((found.price * feePercentage) / 100);
        uint sellerFee = found.price - swanFee;

        payable(found.seller).transfer(sellerFee);
        payable(swanWallet).transfer(swanFee);

        isERC721 = isIERC721(found.tokenContractAddress);
        isERC1155 = isIERC1155(found.tokenContractAddress);
        if (isERC721 == true) {
            IERC721(found.tokenContractAddress).safeTransferFrom(found.seller, msg.sender, found.tokenId);
        } else if (isERC1155 == true) {
            IERC1155(found.tokenContractAddress).safeTransferFrom(found.seller, msg.sender, found.tokenId, 1, 'Swan-Marketplace');
        }

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

    function isIERC721(address tokenContractAddress) internal view returns(bool) {
        return tokenContractAddress.supportsERC165() && (IERC165(tokenContractAddress).supportsInterface(_INTERFACE_ID_ERC721) ||
            IERC165(tokenContractAddress).supportsInterface(_INTERFACE_ID_IERC721ENUMERABLE));
    }

    function isIERC1155(address tokenContractAddress) internal view returns(bool) {
        return tokenContractAddress.supportsERC165() && IERC165(tokenContractAddress).supportsInterface(_INTERFACE_ID_ERC1155);
    }

    function checkValidityOfIERC721(IERC721 nft, uint tokenId, address sender) internal view {
        require(nft.ownerOf(tokenId) == sender, "Incorrect owner of token");
        require(nft.getApproved(tokenId) == address(this), "Token is not approved for transfer");
    }

    function checkValidityOfIERC1155(IERC1155 nft, uint tokenId, address sender) internal view {
        require(nft.balanceOf(sender, tokenId) != 0, "Incorrect owner of token");
        require(nft.isApprovedForAll(sender, address(this)), "Token is not approved for transfer");
    }

    function isValidERC721Listing(TokenListing memory toFilter) internal view returns(bool) {
        IERC721 nft = IERC721(toFilter.tokenContractAddress);
        if (nft.ownerOf(toFilter.tokenId) != toFilter.seller || nft.getApproved(toFilter.tokenId) != address(this)) {
            return true;
        }
        return false;
    }

    function isValidERC1155Listing(TokenListing memory toFilter) internal view returns(bool) {
        IERC1155 nft = IERC1155(toFilter.tokenContractAddress);
        if (nft.balanceOf(toFilter.seller, toFilter.tokenId) != 0 || nft.isApprovedForAll(toFilter.seller, address(this))) {
            return true;
        }
        return false;
    }
}
