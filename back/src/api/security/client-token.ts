import { MongoDocument } from "../../infrastructure/mongo-document";
import { Entity } from "typeorm";

@Entity("client-tokens")
export class ClientToken extends MongoDocument {}
