// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNft is ERC721URIStorage, Ownable  {

    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    constructor() ERC721("TestNft", "TST") {

    }

    function createNft(address receiver) public onlyOwner returns(uint256) {
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _mint(receiver, newItemId);
        //_setTokenUri(newItemId, tokenUri);

        return newItemId;
    }
}
