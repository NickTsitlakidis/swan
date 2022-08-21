import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ActivateListingDto, CreateListingDto, EntityDto, SubmitListingDto } from "@swan/dto";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CreateListingCommand } from "../commands/listing/create-listing-command";
import { CommandBus } from "@nestjs/cqrs";
import { SubmitListingCommand } from "../commands/listing/submit-listing-command";
import { ActivateListingCommand } from "../commands/listing/activate-listing-command";

@Controller("listings")
export class ListingController {
    constructor(private _commandBus: CommandBus) {}

    @UseGuards(UserGuard)
    @Post("create-listing")
    create(@RequestUserId() userId: string, @Body() dto: CreateListingDto): Promise<EntityDto> {
        const command = CreateListingCommand.fromDto(dto, userId);
        return this._commandBus.execute(command);
    }

    @UseGuards(UserGuard)
    @Post("activate-listing")
    activate(@Body() dto: ActivateListingDto): Promise<EntityDto> {
        return this._commandBus.execute(new ActivateListingCommand(dto.blockNumber, dto.listingId));
    }

    @UseGuards(UserGuard)
    @Post("submit-listing")
    submit(@Body() dto: SubmitListingDto): Promise<EntityDto> {
        return this._commandBus.execute(new SubmitListingCommand(dto.chainTransactionId, dto.listingId));
    }
}
