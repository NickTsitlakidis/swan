export class NftMintTransactionDto {
    constructor(
        public id: string,
        public transactionId: string,
        public tokenContractAddress: string,
        public tokenId?: string
    ) {}
}
