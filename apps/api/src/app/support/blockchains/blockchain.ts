import { MongoDocument } from "../../infrastructure/mongo-document";
import { Column, Entity } from "typeorm";

@Entity("blockchains")
export class Blockchain extends MongoDocument {

    @Column()
    name: string;

    @Column()
    mainTokenName: string;

    @Column()
    mainTokenSymbol: string;

    @Column()
    isTestNetwork: boolean;

    @Column()
    rpcUrl: string;

    @Column()
    chainId: string;

    @Column()
    scanSiteUrl: string;
}