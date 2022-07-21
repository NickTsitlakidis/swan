import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import { CreateNftInput, Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { from, map, Observable, switchMap, zip } from "rxjs";
import { ChainsModule } from "../chains.module";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";

@Injectable({
    providedIn: ChainsModule
})
export class MetaplexService {
    private _metaplex: Metaplex;
    private _connection: Connection;

    constructor(private _httpClient: HttpClient) {
        this._connection = new Connection(clusterApiUrl("devnet"));
        this._metaplex = Metaplex.make(this._connection);
    }

    public async mintNFT(nftInput: CreateNftInput, wallet: Wallet) {
        const pubKey = nftInput.owner;
        this._metaplex.use(walletAdapterIdentity(wallet.adapter));
        let account;
        if (pubKey) {
            account = await this._connection.getAccountInfo(pubKey);
        }
        if (account?.owner) {
            return await this._metaplex.nfts().create(nftInput).run();
        } else {
            return;
        }
    }

    public getUserNFTs(pubKey: string): Observable<MetaplexMetadata[]> {
        return from(this._metaplex.nfts().findAllByOwner(new PublicKey(pubKey)).run()).pipe(
            switchMap((lazyNfts) => {
                return zip(lazyNfts.map((lazyNft) => this._httpClient.get<MetaplexMetadata>(lazyNft.uri)));
            }),
            map((nfts) => {
                return nfts;
            })
        );
    }
}
