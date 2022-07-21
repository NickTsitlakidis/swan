import { NftMintTransactionDto } from "@nft-marketplace/common";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";
import { Observable } from "rxjs";
import { CreateNft } from "./nft";
import { WalletEvent } from "./wallet-event";

export interface WalletService {
    getPublicKey(): Observable<string>;
    signMessage(message: string): Observable<string | undefined>;
    mint(nft: CreateNft): Observable<NftMintTransactionDto>;
    getEvents(): Observable<WalletEvent>;
    getUserNFTs(): Observable<MetaplexMetadata[]>;
}
