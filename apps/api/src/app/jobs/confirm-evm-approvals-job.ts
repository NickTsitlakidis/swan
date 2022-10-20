import { Define, Every, Processor } from "@agent-ly/nestjs-agenda";
import { Logger } from "@nestjs/common";
import { getLogger } from "../infrastructure/logging";
import { ListingViewRepository } from "../views/listing/listing-view-repository";
import { concat, defer, EMPTY, from, mergeMap } from "rxjs";
import { ConfigService } from "@nestjs/config";

@Processor()
export class ConfirmEvmApprovalsJob {
    private _logger: Logger;

    constructor(
        private readonly _listingViewRepository: ListingViewRepository,
        private readonly _configService: ConfigService
    ) {
        this._logger = getLogger(ConfirmEvmApprovalsJob);
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
}
