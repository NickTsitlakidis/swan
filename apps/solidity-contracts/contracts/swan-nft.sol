// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract SwanNft is ERC721URIStorage, Ownable, IERC721Enumerable {

    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    // Mapping from owner address to array of token ids
    mapping(address => uint256[]) private _ownerTokenIds;

    constructor() ERC721("SwanNft", "SNFT") {

    }

    function createItem(address receiver, string memory tokenURI) public returns(uint256) {
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _safeMint(receiver, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721) {
        int foundAtFrom = -1;

        for(uint256 i = 0; i< _ownerTokenIds[from].length; i++) {
            if(_ownerTokenIds[from][i] == tokenId) {
                foundAtFrom = int(i);
            }
        }

        if(foundAtFrom != -1) {
            for (uint256 j = uint256(foundAtFrom); j<_ownerTokenIds[from].length-1; j++) {
                _ownerTokenIds[from][j] = _ownerTokenIds[from][j+1];
            }
            _ownerTokenIds[from].pop();
        }

        _ownerTokenIds[to].push(tokenId);
        super._afterTokenTransfer(from, to, tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return tokenIds.current();
    }

    function tokenByIndex(uint256 index) external view returns (uint256) {
        if(index < tokenIds.current()) {
            return index + 1;
        }

        return 0;
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256) {
        if(_ownerTokenIds[owner].length == 0) {
            return 0;
        }

        if(_ownerTokenIds[owner].length <= index) {
            return 0;
        }

        return _ownerTokenIds[owner][index];
    }

    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256[] memory ids = _ownerTokenIds[owner];
        return ids;
    }
}
