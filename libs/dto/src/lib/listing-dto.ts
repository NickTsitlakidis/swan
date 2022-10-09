export class ListingDto {
    id: string;
    blockchainId: string;
    categoryId: string;
    sellerAddress: string;
    price: number;
    imageUrl: string;
    tokenContractAddress?: string;
    nftAddress?: string;
    chainTokenId?: number;
    animationUrl?: string;
    walletId: string;
}
