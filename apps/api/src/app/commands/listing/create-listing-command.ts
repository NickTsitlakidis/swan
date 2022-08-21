import { CreateListingDto } from "@swan/dto";

export class CreateListingCommand {
    price: number;

    nftId?: string;

    categoryId: string;

    blockchainId: string;

    tokenContractAddress?: string;

    chainTokenId?: string;

    userId: string;

    static fromDto(dto: CreateListingDto, userId: string) {
        const command = new CreateListingCommand();
        command.price = dto.price;
        command.tokenContractAddress = dto.tokenContractAddress;
        command.blockchainId = dto.blockchainId;
        command.nftId = dto.nftId;
        command.categoryId = dto.categoryId;
        command.userId = userId;
        command.chainTokenId = dto.chainTokenId;
        return command;
    }
}
