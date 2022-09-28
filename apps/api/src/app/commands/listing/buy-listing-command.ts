export class BuyListingCommand {
    constructor(
        public listingId: string,
        public userId: string,
        public chainTransactionHash: string,
        public blockNumber: number,
        public walletId: string
    ) {}
}
