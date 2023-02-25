import { NftMetadataAttributeDto, NftMetadataDto } from "@swan/dto";

export class CreateNftCommand {
    collectionId: string;
    imageType: string;
    imageName: string;
    categoryId: string;
    s3uri: string;
    name: string;
    description: string;
    resellPercentage: number;
    maxSupply: number;
    chainId: string;
    walletId: string;
    attributes: Array<NftMetadataAttributeDto>;
    userId: string;

    static fromDto(dto: NftMetadataDto): CreateNftCommand {
        const command = new CreateNftCommand();

        if (dto.collectionId) command.collectionId = dto.collectionId;
        command.imageType = dto.imageType;
        command.imageName = dto.imageName;
        command.categoryId = dto.categoryId;
        command.s3uri = dto.s3uri;
        command.name = dto.name;
        command.description = dto.description;
        command.resellPercentage = dto.resellPercentage;
        command.maxSupply = dto.maxSupply;
        command.chainId = dto.chainId;
        command.walletId = dto.walletId;
        command.attributes = dto.attributes;

        return command;
    }
}
