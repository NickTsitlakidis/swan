// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface ERC721Token {
    function transferFrom(address from, address to, uint256 tokenId) external;
}