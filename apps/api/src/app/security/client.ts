import { Entity, Property } from "@mikro-orm/core";
import { MikroDocument } from "../infrastructure/mikro-document";

@Entity({collection: "clients"})
export class Client extends MikroDocument {
    @Property()
    applicationId: string;

    @Property()
    applicationSecret: string;

    @Property()
    applicationName: string;
}
