import { ProfileNftDto } from "@swan/dto";

export class CreateNftExternalCommand {
    blockchainId: string;
    imageUri: string;
    categoryId: string;
    tokenId: string;
    tokenContractAddress: string;
    nftAddress: string;
    walletId: string;
    userId: string;
    metadataUri: string;

    static fromDto(dto: ProfileNftDto, userId: string): CreateNftExternalCommand {
        const command = new CreateNftExternalCommand();

        command.imageUri = dto.imageUri;
        command.categoryId = dto.category.id;
        command.tokenId = dto.tokenId;
        command.tokenContractAddress = dto.tokenContractAddress;
        command.nftAddress = dto.nftAddress;
        command.blockchainId = dto.blockchain.id;
        command.walletId = dto.walletId;
        command.userId = userId;
        command.metadataUri = dto.metadataUri;

        return command;
    }
}
