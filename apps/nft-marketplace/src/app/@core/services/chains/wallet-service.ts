import { BlockchainDto, ListingDto, NftMintTransactionDto } from "@swan/dto";
import { Observable } from "rxjs";
import { CreateNft } from "./create-nft";
import { WalletEvent } from "./wallet-event";
import { ListingResult } from "@swan/contracts";
import { CreateListing } from "./create-listing";

export interface WalletService {
    getPublicKey(): Observable<string>;
    signMessage(message: string): Observable<string | undefined>;
    mint(nft: CreateNft): Observable<NftMintTransactionDto>;
    getEvents(): Observable<WalletEvent>;
    createListing(listing: CreateListing): Observable<string>;
    buyToken(listing: ListingDto, blockchain?: BlockchainDto): Observable<string>;
    getListingResult(transactionHash: string, marketplaceContractAddress: string): Observable<ListingResult>;
}
