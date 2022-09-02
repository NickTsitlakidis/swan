import { Injectable } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import {
    CreateAuctionHouseInput,
    CreateNftInput,
    Listing,
    Metaplex,
    sol,
    walletAdapterIdentity
} from "@metaplex-foundation/js";
import { CreateListingOutput } from "@metaplex-foundation/js/dist/types/plugins/auctionHouseModule/createListing";
import { clusterApiUrl, Connection, PublicKey, Signer } from "@solana/web3.js";
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
            return await this._metaplex.nfts().create(nftInput).run();
        } else {
            return;
        }
    }

    public async createListing(
        nftAddress: string,
        wallet: Wallet | null
    ): Promise<
        CreateListingOutput & {
            listing: Listing;
        }
    > {
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        this._metaplex.use(walletAdapterIdentity(wallet.adapter));
        const { client } = await this._createAuctionHouse();

        return await client
            .list({
                mintAccount: new PublicKey(nftAddress),
                price: sol(1)
            })
            .run();
    }

    private _createAuctionHouse = async (
        auctioneerAuthority?: Signer | null,
        input: Partial<CreateAuctionHouseInput> = {}
    ) => {
        const { auctionHouse } = await this._metaplex
            .auctions()
            .createAuctionHouse({
                // TODO populate
                sellerFeeBasisPoints: 0,
                auctioneerAuthority: auctioneerAuthority?.publicKey,
                ...input
            })
            .run();

        return {
            auctionHouse,
            client: this._metaplex.auctions().for(auctionHouse, auctioneerAuthority || undefined)
        };
    };
}
