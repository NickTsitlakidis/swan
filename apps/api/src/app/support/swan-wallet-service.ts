import { Keypair } from "@solana/web3.js";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SwanWalletService {
    constructor(private _configService: ConfigService) {}

    getSolanaWallet(): Keypair {
        const ar = this._configService.get("SOLANA_SWAN_SECRET_KEY");
        return Keypair.fromSecretKey(new Uint8Array(ar.split(",")));
    }
}
