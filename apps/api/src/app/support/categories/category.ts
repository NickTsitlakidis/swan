import { Entity, Property } from "@mikro-orm/core";
import { MikroDocument } from "../../infrastructure/mikro-document";

@Entity({collection:"categories"})
export class Category extends MikroDocument {

    @Property()
    name: string;

    @Property()
    imageUrl: string;
}
