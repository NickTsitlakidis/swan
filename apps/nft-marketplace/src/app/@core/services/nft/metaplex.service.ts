import { Injectable } from "@angular/core";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js-next";
import { Connection, clusterApiUrl, Keypair, Cluster } from "@solana/web3.js";

import { environment } from "../../../../environments/environment";

@Injectable()
export class MetaplexService {
    run() {
        const connection = new Connection(clusterApiUrl("testnet"));
        const wallet = Keypair.generate();

        const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet)).use(bundlrStorage());
        console.log(metaplex);
    }
}
