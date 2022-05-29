import { Observable } from "rxjs";
import { CreateNft, MintTransaction } from "./nft";
import { WalletEvent } from "./wallet-event";

export interface BlockchainService {
    getPublicKey(): string;
    signMessage(message: string): Observable<string | undefined>;
    mint(nft: CreateNft): Observable<MintTransaction>;
    getEvents(): Observable<WalletEvent>;
}