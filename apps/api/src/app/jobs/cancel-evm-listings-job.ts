import { Define, Every, Processor } from "@agent-ly/nestjs-agenda";
import { Logger } from "@nestjs/common";
import { getLogger } from "../infrastructure/logging";
import { ListingViewRepository } from "../views/listing/listing-view-repository";
import { defer, EMPTY, expand, from, map, mergeMap, Observable } from "rxjs";
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
import { EventStore } from "../infrastructure/event-store";
import { ListingFactory } from "../domain/listing/listing-factory";
import { Listing } from "../domain/listing/listing";

@Processor()
export class CancelEvmListingsJob {
    private _logger: Logger;
    private _allChains: Array<Blockchain>;
    private _activeMarketplaceContracts: Array<EvmContract>;

    constructor(
        private readonly _listingViewRepository: ListingViewRepository,
        private readonly _contractFactory: ContractFactory,
        private readonly _blockchainRepository: BlockchainRepository,
        private readonly _configService: ConfigService,
        private readonly _evmContractsRepository: EvmContractsRepository,
        private readonly _eventStore: EventStore,
        private readonly _listingFactory: ListingFactory
    ) {
        this._logger = getLogger(CancelEvmListingsJob);
        this._allChains = [];
        this._activeMarketplaceContracts = [];
    }

    @Define("cancel-evm-listings-job")
    @Every("minute")
    confirmApprovalsAndOwners() {
        const pageSize = this._configService.getOrThrow<number>("JOB_PAGE_SIZE");
        let skip = 0;
        const streamPage = (newSkip) => from(this._listingViewRepository.findAllActive(newSkip, pageSize));

        const streamAll: Observable<Array<ListingView>> = defer(() => streamPage(skip)).pipe(
            expand(([views, count]) => {
                skip += pageSize;
                return count === 0 ? EMPTY : streamPage(skip).pipe(map((result) => result[0]));
            })
        );

        streamAll
            .pipe(
                mergeMap((listingsBatch) => from(this.findInvalid(listingsBatch))),
                mergeMap((invalid) => from(this.cancelListings(invalid)))
            )
            .subscribe({
                next: (canceled) => this._logger.debug(`Canceled ${canceled.length} listings`),
                error: (error) => this._logger.error(`job stream stopped due to error : ${error.message}`),
                complete: () => this._logger.log("all listing batches have been processed")
            });
    }

    private async cancelListings(listings: Array<ListingView>) {
        const events = await this._eventStore.findEventsByAggregateIds(listings.map((l) => l.id));
        const groupedEvents = group(events, (ev) => ev.aggregateId);

        const toCommit: Array<Listing> = [];
        for (const [aggregateId, events] of Object.entries(groupedEvents)) {
            const entity = this._listingFactory.createFromEvents(aggregateId, events);
            entity.cancel(true);
            toCommit.push(entity);
        }

        return Promise.all(toCommit.map((entity) => entity.commit()));
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
