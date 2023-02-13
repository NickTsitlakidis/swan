import { Injectable } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import { CreateNftInput, Metaplex, sol, walletAdapterIdentity } from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
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
        const pubKey = nftInput.tokenOwner;
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

    public async createListing(nftAddress: string, price: number, wallet: Wallet) {
        this._metaplex.use(walletAdapterIdentity(wallet.adapter));
        console.log(new PublicKey(nftAddress));
        console.log(wallet);
        const auctionHouse = await this._findAh();
        await this._metaplex.rpc().airdrop(auctionHouse.feeAccountAddress, sol(100));

        console.log(auctionHouse);

        return await this._metaplex.auctionHouse().list({
            auctionHouse,
            mintAccount: new PublicKey(nftAddress),
            price: sol(price)
        });
    }

    private async _findAh() {
        return await this._metaplex
            .auctionHouse()
            .findByAddress({ address: new PublicKey("7nfQ2GgSDoDvgKVeUG5sRPqheua37WBppwU39zFoLoaK") });
    }

    private async _createAuctionHouse() {
        const { auctionHouse } = await this._metaplex.auctionHouse().create({
            sellerFeeBasisPoints: 200
        });

        await this._metaplex.rpc().airdrop(auctionHouse.feeAccountAddress, sol(100));

        return auctionHouse;
    }
}
