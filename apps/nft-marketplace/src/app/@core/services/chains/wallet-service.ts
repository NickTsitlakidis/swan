import { BlockchainDto, ListingDto, NftMintTransactionDto } from "@swan/dto";
import { Observable } from "rxjs";
import { CreateNft } from "./create-nft";
import { WalletEvent } from "./wallet-event";
import { MarketplaceResult } from "@swan/contracts";
import { CreateListing } from "./create-listing";

export interface WalletService {
    getPublicKey(): Observable<string>;
    signMessage(message: string): Observable<string | undefined>;
    mint(nft: CreateNft): Observable<NftMintTransactionDto>;
    getEvents(): Observable<WalletEvent>;
    createListing(listing: CreateListing): Observable<string>;
    getListingResult(transactionHash: string, marketplaceContractAddress: string): Observable<MarketplaceResult>;
    buyToken(listing: ListingDto, blockchain?: BlockchainDto, marketplaceContractAddress?: string): Observable<string>;
}
