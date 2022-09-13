import { ListingViewRepository } from "./../views/listing/listing-view-repository";
import { Injectable } from "@nestjs/common";
import { ListingDto } from "@swan/dto";
import { LogAsyncMethod } from "../infrastructure/logging";

@Injectable()
export class ListingQueryHandler {
    constructor(private _listingViewRepository: ListingViewRepository) {}

    @LogAsyncMethod
    async getActiveListings(
        skip: number,
        limit: number
    ): Promise<{ listingDtos: ListingDto[]; listingsCount: number }> {
        const [listings, listingsCount] = await this._listingViewRepository.findAllActive(skip, limit);
        const listingDtos = [];
        listings.forEach((listing) => {
            const lto = new ListingDto();
            lto.id = listing.id;
            lto.blockchainId = listing.blockchainId;
            lto.categoryId = listing.categoryId;
            lto.chainTokenId = listing.chainTokenId;
            lto.nftAddress = listing.nftAddress;
            lto.price = listing.price;
            lto.sellerAddress = listing.sellerAddress;
            lto.tokenContractAddress = listing.tokenContractAddress;
            listingDtos.push(lto);
        });

        return { listingDtos, listingsCount };
    }
}
