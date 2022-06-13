import { Injectable } from "@nestjs/common";
import { MetaplexMetadata, NFTStorageMetaplexor, StoreNFTResult } from "@nftstorage/metaplex-auth";
import { SwanWalletService } from "./swan-wallet-service";
import { Image } from "./image";
import * as fs from "fs";

@Injectable()
export class SolanaUploaderService {
    private _client: NFTStorageMetaplexor;

    constructor(private _swanWalletService: SwanWalletService) {
        this._client = NFTStorageMetaplexor.withSecretKey(this._swanWalletService.getSolanaWallet().secretKey, {
                 solanaCluster: 'devnet',
                 mintingAgent: 'swan',
             });
    }

    async uploadMetadata(metadata: MetaplexMetadata, image: Image, nftId: string): Promise<StoreNFTResult> {
        const finalImageName = `${nftId}-${image.name}`;
        const savedImage = fs.writeFileSync(finalImageName, image.file);

        metadata.image = `./${finalImageName}`;
        metadata.properties.files[0].uri = `./${finalImageName}`;
        metadata.properties.files[0].type = `./${image.type}`;

        const savedMetadata = fs.writeFileSync(`metadata-${nftId}.json`, JSON.stringify(metadata));
        const result = await this._client.storeNFTFromFilesystem(`./metadata-${nftId}.json`);

        fs.unlinkSync(`./${finalImageName}`);
        fs.unlinkSync(`./metadata-${nftId}.json`);

        return result;
    }
}