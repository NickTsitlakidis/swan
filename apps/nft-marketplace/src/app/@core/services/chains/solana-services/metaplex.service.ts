import { Injectable } from "@angular/core";
import { Wallet } from "@heavy-duty/wallet-adapter";
import { CreateNftInput, Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { ChainsModule } from "../chains.module";

@Injectable({
    providedIn: ChainsModule
})
export class MetaplexService {
    private _metaplex: Metaplex;
    private _storage: StorageDriver;
    private _connection: Connection;

    constructor() {
        this._connection = new Connection(clusterApiUrl("devnet"));
        this._metaplex = Metaplex.make(this._connection);
        this._storage = this._metaplex.storage();
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

    /* public async uploadFile(fileName: string, file: File) {
        const { uri, metadata } = await this._metaplex.nfts().uploadMetadata({
            name: fileName,
            image: await useMetaplexFileFromBrowser(file),
            properties: {
                files: [
                    {
                        type: file.type,
                        uri: await useMetaplexFileFromBrowser(file)
                    }
                ]
            }
        });

        console.log(metadata.image); // https://arweave.net/123
        console.log(metadata?.properties?.files && metadata?.properties?.files[0]?.uri); // https://arweave.net/456
        console.log(uri); // https://arweave.net/789
    } */
}
