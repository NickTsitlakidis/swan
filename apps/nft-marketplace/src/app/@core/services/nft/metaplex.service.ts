import { Injectable } from "@angular/core";
import { CreateNftInput, Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js-next";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

import { UserAuthService } from "../authentication/user_auth.service";
import { SolanaWalletService } from "../chains/solana.wallet.service";

@Injectable()
export class MetaplexService {
    constructor(private _userAuthService: UserAuthService, private _solanaWalletService: SolanaWalletService) {}

    public async mintNFT(nftInput: CreateNftInput) {
        const connection = new Connection(clusterApiUrl("devnet"));
        const metaplex = Metaplex.make(connection);

        const pubKey = new PublicKey(this._userAuthService.getPublicKey());
        this._solanaWalletService.wallet$.subscribe(async (wallet) => {
            if (wallet) {
                metaplex.use(walletAdapterIdentity(wallet.adapter));
                const account = await connection.getAccountInfo(pubKey);
                if (account?.owner) {
                    await metaplex.nfts().create(nftInput);

                }
            }
        });
    }
}
