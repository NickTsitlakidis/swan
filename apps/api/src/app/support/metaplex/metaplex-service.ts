import { Injectable } from "@nestjs/common";
import { MetaplexMetadata, NFTStorageMetaplexor } from "@nftstorage/metaplex-auth";
import { isNil } from "lodash";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, PublicKey, Keypair } from "@solana/web3.js";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MetaplexService {
    private _metaplexor: NFTStorageMetaplexor;
    private _metaplex: Metaplex;
    private _connection: Connection;

    constructor(private _configService: ConfigService) {
        this._connection = new Connection(clusterApiUrl("devnet"));
        this._metaplex = Metaplex.make(this._connection);
    }

    getMetaplexor(): NFTStorageMetaplexor {
        if (isNil(this._metaplexor)) {
            const ar = this._configService.get("SOLANA_SWAN_SECRET_KEY");
            const solanaKeyPair = Keypair.fromSecretKey(new Uint8Array(ar.split(",")));
            this._metaplexor = NFTStorageMetaplexor.withSecretKey(solanaKeyPair.secretKey, {
                solanaCluster: "devnet",
                mintingAgent: "swan"
            });
        }

        return this._metaplexor;
    }

    public async getUserNFTs(pubKey: string): Promise<MetaplexMetadata[]> {
        const lazyNfts = await this._metaplex
            .nfts()
            .findAllByOwner({ owner: new PublicKey(pubKey) })
            .run();
        const promises = lazyNfts.map((lazyNft) => axios.get<MetaplexMetadata>(lazyNft.uri));
        const nfts = await Promise.all(promises);
        return nfts.map((nft) => nft.data);
    }
}
