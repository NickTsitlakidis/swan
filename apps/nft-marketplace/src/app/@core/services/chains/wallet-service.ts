import { NftMintTransactionDto } from "@swan/dto";
import { Observable } from "rxjs";
import { CreateNft } from "./nft";
import { WalletEvent } from "./wallet-event";
import { ListingResult } from "@swan/contracts";

export interface WalletService {
    getPublicKey(): Observable<string>;
    signMessage(message: string): Observable<string | undefined>;
    mint(nft: CreateNft): Observable<NftMintTransactionDto>;
    getEvents(): Observable<WalletEvent>;
    createListing(price: number, tokenContractAddress?: string, tokenId?: number): Observable<string>;
    getListingResult(transactionHash: string): Observable<ListingResult>;
}
