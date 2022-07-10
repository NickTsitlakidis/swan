import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { NftDto, NftMetadataDto } from "@nft-marketplace/common";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CreateNftCommand } from "../commands/nft/create-nft-command";
import { CommandBus } from "@nestjs/cqrs";

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
}
