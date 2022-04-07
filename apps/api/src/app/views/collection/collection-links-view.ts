import { Column } from "typeorm";

export class CollectionLinksView {
    @Column()
    instagram: string;
    @Column()
    discord: string;
    @Column()
    telegram: string;
    @Column()
    website: string;
    @Column()
    medium: string;

    constructor(instagram: string, discord: string, telegram: string, website: string, medium: string) {
        this.instagram = instagram;
        this.discord = discord;
        this.telegram = telegram;
        this.website = website;
        this.medium = medium;
    }
}
