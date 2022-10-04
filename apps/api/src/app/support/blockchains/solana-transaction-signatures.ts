export interface Result {
    blockTime: number;
    confirmationStatus: string;
    err?: any;
    memo?: any;
    signature: string;
    slot: number;
}

export interface SolanaTransactionSignatures {
    jsonrpc: string;
    result: Result[];
    id: string;
}
