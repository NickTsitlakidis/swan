// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import './swan-ierc1155.sol';

/**
 * Test utility for checking ERC165 interface identifiers.
 */
contract InterfaceCheck {
    function erc1155WithUri() external view returns (bytes4) {
        return type(SwanIERC1155NFT).interfaceId;
    }
}
