import { Injectable } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import { CreateNftInput, Metaplex, Nft, walletAdapterIdentity } from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { from, Observable } from "rxjs";
import { ChainsModule } from "../chains.module";

@Injectable({
    providedIn: ChainsModule
})
export class MetaplexService {
    private _metaplex: Metaplex;
    private _connection: Connection;

    constructor() {
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
            return await this._metaplex.nfts().create(nftInput);
        } else {
            return;
        }
    }

    public getUserNFTs(pubKey: string): Observable<Nft[]> {
        console.log(pubKey);
        return from(this._metaplex.nfts().findAllByOwner(new PublicKey(pubKey)));
    }
}
