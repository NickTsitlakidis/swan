import { Injectable } from "@angular/core";
import { Metaplex } from "@metaplex-foundation/js-next";
import { Connection, clusterApiUrl, Cluster } from "@solana/web3.js";
import { environment } from "../../../../environments/environment";

@Injectable()
export class MetaplexService {
    private _cluster: Cluster;
    constructor() {
        this._cluster = <Cluster>environment.solanaNetwork;
        const connection = new Connection(clusterApiUrl(this._cluster));
        console.log(connection);
        /* const metaplex = new Metaplex(connection);
        console.log(metaplex); */
    }
}
