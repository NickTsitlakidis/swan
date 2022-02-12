import { MongoDocument } from "../../infrastructure/mongo-document";
import { Column, Entity } from "typeorm";

@Entity("clients")
export class Client extends MongoDocument {
    @Column()
    applicationId: string;

    @Column()
    applicationSecret: string;

    @Column()
    applicationName: string;
}
