export class ActivateListingCommand {
    constructor(public blockNumber: number, public listingId: string, public chainListingId: number) {}
}
