import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";
import { Blockchains } from "@nft-marketplace/common";

@SerializedEvent("collection-created-event")
export class CollectionCreatedEvent extends EventPayload {
    constructor(
        public userId: string,
        public name: string,
        public categoryId: string,
        public customUrl: string,
        public description: string,
        public isExplicit: boolean,
        public imageUrl: string,
        public salePercentage: number,
        public blockchain: Blockchains,
        public paymentToken: string,
        public instagramLink: string,
        public mediumLink: string,
        public telegramLink: string,
        public websiteLink: string,
        public discordLink: string
    ) {
        super();
    }
}