import { Define, Every, Processor } from "@agent-ly/nestjs-agenda";
import { Logger } from "@nestjs/common";
import { getLogger } from "../infrastructure/logging";
import { ListingViewRepository } from "../views/listing/listing-view-repository";
import { defer, EMPTY, expand, from, mergeMap, Observable, of, Subscription } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { ListingView } from "../views/listing/listing-view";
import { group } from "radash";
import { EventStore } from "../infrastructure/event-store";
import { ListingFactory } from "../domain/listing/listing-factory";
import { Listing } from "../domain/listing/listing";
import { ListingFilters } from "./listing-filters";
import { SourcedEvent } from "../infrastructure/sourced-event";

@Processor()
export class CancelEvmListingsJob {
    private _logger: Logger;

    constructor(
        private readonly _listingFilters: ListingFilters,
        private readonly _listingViewRepository: ListingViewRepository,
        private readonly _configService: ConfigService,
        private readonly _eventStore: EventStore,
        private readonly _listingFactory: ListingFactory
    ) {
        this._logger = getLogger(CancelEvmListingsJob);
    }

    @Define("cancel-evm-listings-job")
    @Every(`${process.env.CANCEL_EVM_LISTINGS_DURATION} minutes`)
    confirmApprovalsAndOwners(): Subscription {
        const pageSize = +this._configService.getOrThrow<number>("JOB_PAGE_SIZE");
        let skip = 0;
        const streamPage = (newSkip: number) => {
            return from(this._listingViewRepository.findAllActive(newSkip, pageSize));
        };

        const streamAll: Observable<[ListingView[], number]> = defer(() => streamPage(skip)).pipe(
            expand(([views, count]) => {
                skip += pageSize;
                return count <= views.length ? EMPTY : streamPage(skip);
            })
        );

        return streamAll
            .pipe(
                mergeMap(([listingsBatch]) => {
                    return from(this._listingFilters.filterForInvalidUsingContract(listingsBatch));
                }),
                mergeMap((invalid) => (invalid.length === 0 ? of([]) : from(this.cancelListings(invalid))))
            )
            .subscribe({
                next: (canceled) => this._logger.debug(`Canceled ${canceled.length} listings`),
                error: (error) => {
                    this._logger.error(`job stream stopped due to error : ${error.message}`);
                },
                complete: () => this._logger.log("all listing batches have been processed")
            });
    }

    private async cancelListings(listings: Array<ListingView>) {
        const storedEvents = await this._eventStore.findEventsByAggregateIds(listings.map((l) => l.id));
        const groupedEvents = group(storedEvents, (ev) => ev.aggregateId);

        const toCommit: Array<Listing> = [];
        const aggregateIds = Object.keys(groupedEvents);
        for (const aggregateId of aggregateIds) {
            const events = groupedEvents[aggregateId] as Array<SourcedEvent>;
            const entity = this._listingFactory.createFromEvents(aggregateId, events);
            try {
                entity.cancel(true);
                toCommit.push(entity);
            } catch (error) {
                this._logger.debug(`Error during listing cancellation : ${(error as Error).message}`);
            }
        }

        return Promise.all(toCommit.map((entity) => entity.commit()));
    }
}
