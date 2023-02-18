export interface BlockchainNftTransactionsBody {
    tokenAdress: string;
    tokenId: number;
    chainId?: number;
    rpcUrl?: string;
}

export interface BlockchainNftTransactionsResponse {
    transactionId: string;
    blockNumber?: number;
}
