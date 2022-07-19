import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { EntityDto, NftDto, NftMetadataDto, NftMintTransactionDto } from "@nft-marketplace/common";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CreateNftCommand } from "../commands/nft/create-nft-command";
import { CommandBus } from "@nestjs/cqrs";
import { MintNftCommand } from "../commands/nft/mint-nft-command";

@Controller("nft")
export class NftController {
    constructor(private _commandBus: CommandBus) {}

    @Post("/create")
    @UseGuards(UserGuard)
    async create(@RequestUserId() userId: string, @Body() dto: NftMetadataDto): Promise<NftDto> {
        const command = CreateNftCommand.fromDto(dto);
        command.userId = userId;
        return this._commandBus.execute(command);
    }

    @Post("/nft-minted")
    @UseGuards(UserGuard)
    async nftMinted(@RequestUserId() userId: string, @Body() dto: NftMintTransactionDto): Promise<EntityDto> {
        const command = MintNftCommand.fromDto(userId, dto);
        command.userId = userId;
        return this._commandBus.execute(command);
    }
}
