import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class CollectionLinksView {
    @Property()
    instagram: string;
    @Property()
    discord: string;
    @Property()
    telegram: string;
    @Property()
    website: string;
    @Property()
    medium: string;

    constructor(instagram: string, discord: string, telegram: string, website: string, medium: string) {
        this.instagram = instagram;
        this.discord = discord;
        this.telegram = telegram;
        this.website = website;
        this.medium = medium;
    }
}
