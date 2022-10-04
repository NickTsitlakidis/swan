import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { EntityDto, NftDto, NftMetadataDto, NftMintTransactionDto, ProfileNftDto } from "@swan/dto";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CreateNftCommand } from "../commands/nft/create-nft-command";
import { CommandBus } from "@nestjs/cqrs";
import { MintNftCommand } from "../commands/nft/mint-nft-command";
import { NftQueryHandler } from "../queries/nft-query-handler";
import { CreateNftExternalCommand } from "../commands/nft/create-nft-external-command";

@Controller("nft")
export class NftController {
    constructor(private _commandBus: CommandBus, private _nftQueryHandler: NftQueryHandler) {}

    @Post("/create")
    @UseGuards(UserGuard)
    async create(@RequestUserId() userId: string, @Body() dto: NftMetadataDto): Promise<NftDto> {
        const command = CreateNftCommand.fromDto(dto);
        command.userId = userId;
        return this._commandBus.execute(command);
    }

    @Post("/create-external")
    @UseGuards(UserGuard)
    async createExternal(@RequestUserId() userId: string, @Body() dto: ProfileNftDto): Promise<NftDto> {
        const command = CreateNftExternalCommand.fromDto(dto, userId);
        command.userId = userId;
        return this._commandBus.execute(command);
    }

    @Post("/mint")
    @UseGuards(UserGuard)
    async nftMinted(@RequestUserId() userId: string, @Body() dto: NftMintTransactionDto): Promise<EntityDto> {
        const command = MintNftCommand.fromDto(userId, dto);
        command.userId = userId;
        return this._commandBus.execute(command);
    }

    @Get("/user")
    @UseGuards(UserGuard)
    async getByUserId(@RequestUserId() userId: string): Promise<Array<ProfileNftDto>> {
        return this._nftQueryHandler.getByUserId(userId);
    }

    @Get("/user/external")
    @UseGuards(UserGuard)
    async getExternalByUserId(@RequestUserId() userId: string): Promise<Array<ProfileNftDto>> {
        return this._nftQueryHandler.getExternalByUserId(userId);
    }
}
