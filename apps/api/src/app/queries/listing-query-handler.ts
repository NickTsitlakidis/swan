import { ListingViewRepository } from "../views/listing/listing-view-repository";
import { Injectable } from "@nestjs/common";
import { ListingDto, PageDto, PaginationDto } from "@swan/dto";
import { LogAsyncMethod } from "../infrastructure/logging";

@Injectable()
export class ListingQueryHandler {
    constructor(private _listingViewRepository: ListingViewRepository) {}

    @LogAsyncMethod
    async getActiveListings(paginationDto: PaginationDto): Promise<PageDto<ListingDto>> {
        const [listings, listingsCount] = await this._listingViewRepository.findAllActive(
            paginationDto.skip,
            paginationDto.limit
        );
        const listingDtos = [];
        listings.forEach((listing) => {
            const lto = new ListingDto();
            lto.id = listing.id;
            lto.blockchainId = listing.blockchainId;
            lto.categoryId = listing.categoryId;
            lto.chainTokenId = parseInt(listing.chainTokenId);
            lto.nftAddress = listing.nftAddress;
            lto.price = listing.price;
            lto.sellerAddress = listing.sellerAddress;
            lto.tokenContractAddress = listing.tokenContractAddress;
            lto.animationUrl = listing.animationUrl;
            lto.imageUrl = listing.imageUrl;
            lto.walletId = listing.walletId;
            listingDtos.push(lto);
        });

        return { items: listingDtos, count: listingsCount };
    }
}
