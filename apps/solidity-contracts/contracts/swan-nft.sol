// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SwanNft is ERC721URIStorage, Ownable  {

    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    constructor() ERC721("SwanNft", "SNFT") {

    }

    function createItem(address receiver, string memory tokenURI) public onlyOwner returns(uint256) {
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _safeMint(receiver, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}