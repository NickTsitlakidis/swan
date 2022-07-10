import { Injectable } from "@nestjs/common";
import { NFTStorageMetaplexor } from "@nftstorage/metaplex-auth";
import { SwanWalletService } from "../swan-wallet-service";
import { isNil } from "lodash";

@Injectable()
export class MetaplexService {
    private _metaplexor: NFTStorageMetaplexor;

    constructor(private _swanWalletService: SwanWalletService) {}

    getMetaplexor(): NFTStorageMetaplexor {
        if (isNil(this._metaplexor)) {
            this._metaplexor = NFTStorageMetaplexor.withSecretKey(this._swanWalletService.getSolanaWallet().secretKey, {
                solanaCluster: "devnet",
                mintingAgent: "swan"
            });
        }

        return this._metaplexor;
    }
}
