import { Define, Every, Processor } from "@agent-ly/nestjs-agenda";
import { Logger } from "@nestjs/common";
import { getLogger } from "../infrastructure/logging";
import { ListingViewRepository } from "../views/listing/listing-view-repository";
import { concat, defer, EMPTY, from, mergeMap, Observable, of } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { ListingView } from "../views/listing/listing-view";
import { ContractFactory } from "@swan/contracts";
import { ethers } from "ethers";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { Blockchain } from "../support/blockchains/blockchain";
import { group } from "radash";
import { EvmContractsRepository } from "../support/evm-contracts/evm-contracts-repository";
import { EvmContract } from "../support/evm-contracts/evm-contract";
import { EvmContractType } from "../support/evm-contracts/evm-contract-type";

@Processor()
export class ConfirmEvmApprovalsJob {
    private _logger: Logger;
    private _allChains: Array<Blockchain>;
    private _activeMarketplaceContracts: Array<EvmContract>;

    constructor(
        private readonly _listingViewRepository: ListingViewRepository,
        private readonly _contractFactory: ContractFactory,
        private readonly _blockchainRepository: BlockchainRepository,
        private readonly _configService: ConfigService,
        private readonly _evmContractsRepository: EvmContractsRepository
    ) {
        this._logger = getLogger(ConfirmEvmApprovalsJob);
        this._allChains = [];
        this._activeMarketplaceContracts = [];
    }

    @Define("confirm-approvals-job")
    @Every("minute")
    confirmApprovalsAndOwners() {
        const pageSize = this._configService.get<number>("JOB_PAGE_SIZE");
        let skip = 0;
        const streamPage = (newSkip) => from(this._listingViewRepository.findAllActive(newSkip, pageSize));

        const streamAll = defer(() => streamPage(skip)).pipe(
            mergeMap(([views, count]) => {
                skip += pageSize;
                const next = count === 0 ? EMPTY : streamPage(skip);
                return concat(from(views), next);
            })
        );

        streamAll.subscribe();
    }

    private async findInvalid(listings: Array<ListingView>): Promise<Array<ListingView>> {
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
                    listingId: parseInt(listing.chainListingId),
                    tokenId: listing.chainTokenId,
                    tokenContractAddress: listing.tokenContractAddress
                }))
            );

            const invalidListings = listings.filter((listing) =>
                invalidIds.some((id) => id === parseInt(listing.chainListingId))
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
