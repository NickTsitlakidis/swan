import { Injectable } from "@nestjs/common";
import { ContractFactory } from "@swan/contracts";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { EvmContractsRepository } from "../support/evm-contracts/evm-contracts-repository";
import { ListingView } from "../views/listing/listing-view";
import { group } from "radash";
import { ethers } from "ethers";
import { Blockchain } from "../support/blockchains/blockchain";
import { EvmContract } from "../support/evm-contracts/evm-contract";
import { EvmContractType } from "../support/evm-contracts/evm-contract-type";

@Injectable()
export class ListingFilters {
    private _allChains: Array<Blockchain>;
    private _activeMarketplaceContracts: Array<EvmContract>;

    constructor(
        private readonly _contractFactory: ContractFactory,
        private readonly _blockchainRepository: BlockchainRepository,
        private readonly _evmContractsRepository: EvmContractsRepository
    ) {
        this._allChains = [];
        this._activeMarketplaceContracts = [];
    }

    async filterForInvalidUsingContract(listings: Array<ListingView>): Promise<Array<ListingView>> {
        const groupedListings = group(listings, (listing) => listing.blockchainId);
        const chains = await this.getChains();
        const activeContracts = await this.getActiveMarketplaceContracts();

        let allInvalid: Array<ListingView> = [];
        for (const [blockchainId, listings] of Object.entries(groupedListings)) {
            const chain = chains.find((c) => c.id === blockchainId);
            const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
            const contractAddress = activeContracts.find((c) => c.blockchainId === blockchainId).deploymentAddress;
            const contract = this._contractFactory.createMarketplace(provider, contractAddress);

            const invalidIds = await contract.filterForInvalid(
                listings.map((listing) => ({
                    seller: listing.sellerAddress,
                    price: listing.price,
                    listingId: listing.chainListingId,
                    tokenId: listing.chainTokenId,
                    tokenContractAddress: listing.tokenContractAddress
                }))
            );

            const invalidListings = listings.filter((listing) =>
                invalidIds.some((id) => id === listing.chainListingId)
            );

            allInvalid = allInvalid.concat(invalidListings);
        }

        return allInvalid;
    }

    private async getChains(): Promise<Array<Blockchain>> {
        if (this._allChains.length === 0) {
            this._allChains = await this._blockchainRepository.findAll();
        }

        return this._allChains;
    }

    private async getActiveMarketplaceContracts(): Promise<Array<EvmContract>> {
        if (this._activeMarketplaceContracts.length === 0) {
            this._activeMarketplaceContracts = await this._evmContractsRepository.findByTypeAndActive(
                EvmContractType.MARKETPLACE
            );
        }

        return this._activeMarketplaceContracts;
    }
}