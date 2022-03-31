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
}
