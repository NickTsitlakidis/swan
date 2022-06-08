import { Injectable } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import { CreateNftInput, Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js-next";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { ChainsModule } from "../chains.module";

@Injectable({
    providedIn: ChainsModule
})
export class MetaplexService {
    public async mintNFT(nftInput: CreateNftInput, wallet: Wallet) {
        const connection = new Connection(clusterApiUrl("devnet"));
        const metaplex = Metaplex.make(connection);

        const pubKey = nftInput.owner;
        metaplex.use(walletAdapterIdentity(wallet.adapter));
        let account;
        if (pubKey) {
            account = await connection.getAccountInfo(pubKey);
        }
        if (account?.owner) {
            return await metaplex.nfts().create(nftInput);
        } else {
            return;
        }
    }
}
