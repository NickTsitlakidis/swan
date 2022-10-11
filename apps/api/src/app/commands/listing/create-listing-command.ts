import { CreateListingDto } from "@swan/dto";

export class CreateListingCommand {
    price: number;
    nftId?: string;
    categoryId: string;
    blockchainId: string;
    tokenContractAddress?: string;
    nftAddress?: string;
    chainTokenId?: string;
    userId: string;
    walletId: string;
    animationUrl?: string;
    marketPlaceContractAddress?: string;
    imageUrl: string;

    static fromDto(dto: CreateListingDto, userId: string) {
        const command = new CreateListingCommand();
        command.price = dto.price;
        command.tokenContractAddress = dto.tokenContractAddress;
        command.nftAddress = dto.nftAddress;
        command.blockchainId = dto.blockchainId;
        command.nftId = dto.nftId;
        command.categoryId = dto.categoryId;
        command.userId = userId;
        command.chainTokenId = dto.chainTokenId;
        command.walletId = dto.walletId;
        command.animationUrl = dto.animationUrl;
        command.imageUrl = dto.imageUrl;
        command.marketPlaceContractAddress = dto.marketPlaceContractAddress;
        return command;
    }
}
