export interface Result {
    blockTime: number;
    confirmationStatus: string;
    err?: unknown;
    memo?: unknown;
    signature: string;
    slot: number;
}

export interface SolanaTransactionSignatures {
    jsonrpc: string;
    result: Result[];
    id: string;
}
