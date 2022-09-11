import { DeployedContract } from "../deployed-contract";

export const FANTOM_MARKETPLACE_MAIN_NET: DeployedContract = {
    blockchainId: "628e9c836b8991c676c19a45",
    version: "1",
    address: "0xa4CCE6e04fB7B266E3886Cf4642deB385b9c2586",
    abi: [
        {
            inputs: [],
            stateMutability: "nonpayable",
            type: "constructor"
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "address",
                    name: "seller",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "tokenAddress",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "listingId",
                    type: "uint256"
                }
            ],
            name: "ListingCancelled",
            type: "event"
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "address",
                    name: "seller",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "listingId",
                    type: "uint256"
                }
            ],
            name: "ListingCreated",
            type: "event"
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "address",
                    name: "seller",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "currentPrice",
                    type: "uint256"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "previousPrice",
                    type: "uint256"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "listingId",
                    type: "uint256"
                }
            ],
            name: "ListingUpdated",
            type: "event"
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "previousOwner",
                    type: "address"
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "newOwner",
                    type: "address"
                }
            ],
            name: "OwnershipTransferred",
            type: "event"
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: false,
                    internalType: "address",
                    name: "seller",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "buyer",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256"
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "listingId",
                    type: "uint256"
                }
            ],
            name: "TokenSold",
            type: "event"
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                }
            ],
            name: "buyToken",
            outputs: [],
            stateMutability: "payable",
            type: "function"
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                }
            ],
            name: "cancelListing",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                },
                {
                    internalType: "uint256",
                    name: "price",
                    type: "uint256"
                }
            ],
            name: "createListing",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [],
            name: "getFeePercentage",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256"
                }
            ],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                }
            ],
            name: "getListing",
            outputs: [
                {
                    components: [
                        {
                            internalType: "uint256",
                            name: "price",
                            type: "uint256"
                        },
                        {
                            internalType: "address",
                            name: "tokenContractAddress",
                            type: "address"
                        },
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256"
                        },
                        {
                            internalType: "uint256",
                            name: "listingId",
                            type: "uint256"
                        },
                        {
                            internalType: "address payable",
                            name: "seller",
                            type: "address"
                        }
                    ],
                    internalType: "struct SwanMarketplace.TokenListing",
                    name: "",
                    type: "tuple"
                }
            ],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                }
            ],
            name: "isTokenListed",
            outputs: [
                {
                    internalType: "bool",
                    name: "",
                    type: "bool"
                }
            ],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [],
            name: "owner",
            outputs: [
                {
                    internalType: "address",
                    name: "",
                    type: "address"
                }
            ],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [],
            name: "renounceOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [],
            name: "swanWallet",
            outputs: [
                {
                    internalType: "address",
                    name: "",
                    type: "address"
                }
            ],
            stateMutability: "view",
            type: "function"
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "newOwner",
                    type: "address"
                }
            ],
            name: "transferOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "newFeePercentage",
                    type: "uint256"
                }
            ],
            name: "updateFeePercentage",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "tokenContractAddress",
                    type: "address"
                },
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                },
                {
                    internalType: "uint256",
                    name: "newPrice",
                    type: "uint256"
                }
            ],
            name: "updateListingPrice",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        }
    ]
};
