import { MongoDocument } from "../infrastructure/mongo-document";
import { Entity, Property } from "@mikro-orm/core";

@Entity({ collection: "refresh-tokens" })
export class RefreshToken extends MongoDocument {
    @Property()
    userId: string;

    @Property()
    tokenValue: string;

    @Property()
    isRevoked: boolean;

    @Property({ onCreate: () => new Date() })
    issuedAt: Date = new Date();
}
