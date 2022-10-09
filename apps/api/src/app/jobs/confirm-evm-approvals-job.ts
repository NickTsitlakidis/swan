import { Define, Every, Processor } from "@agent-ly/nestjs-agenda";
import { Logger } from "@nestjs/common";
import { getLogger } from "../infrastructure/logging";

@Processor()
export class ConfirmEvmApprovalsJob {
    private _logger: Logger;

    constructor() {
        this._logger = getLogger(ConfirmEvmApprovalsJob);
    }

    @Define("confirm-approvals-job")
    @Every("minute")
    confirmApprovals() {
        this._logger.log("mouhaha");
    }
}
