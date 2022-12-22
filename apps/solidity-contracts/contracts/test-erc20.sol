// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable, ERC165  {
    constructor() ERC20("TestToken", "TEST") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

contract TestToken721 is ERC721, Ownable {

    constructor() ERC721("TestToken721", "TEST721") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

contract TestToken1155 is ERC1155, Ownable {

    constructor() ERC1155("TestToken1155") {}

    function mint(address to, uint256 id, uint256 amount) public onlyOwner {
        _mint(to, id, amount, "data");
    }

    function ownerOf(address sender, uint256 tokenId) public view returns(bool) {
        return balanceOf(sender, tokenId) != 0;
    }
}
