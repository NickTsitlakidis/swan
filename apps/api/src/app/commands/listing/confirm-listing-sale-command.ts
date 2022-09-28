export class ConfirmListingSaleCommand {
    constructor(public blockNumber: number, public listingId: string, public chainListingId: number) {}
}
