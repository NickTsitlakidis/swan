import { ListingQueryHandler } from "./../queries/listing-query-handler";
import { ClientGuard } from "./../security/guards/client-guard";
import { Body, Controller, Get, Post, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import {
    ActivateListingDto,
    BuyListingDto,
    CreateListingDto,
    EntityDto,
    ListingDto,
    PageDto,
    PaginationDto,
    SubmitListingDto
} from "@swan/dto";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CreateListingCommand } from "../commands/listing/create-listing-command";
import { CommandBus } from "@nestjs/cqrs";
import { SubmitListingCommand } from "../commands/listing/submit-listing-command";
import { ActivateListingCommand } from "../commands/listing/activate-listing-command";
import { BuyListingCommand } from "../commands/listing/buy-listing-command";

@Controller("listings")
export class ListingController {
    constructor(private _commandBus: CommandBus, private _listingQueryHandler: ListingQueryHandler) {}

    @UseGuards(UserGuard)
    @Post("create-listing")
    create(@RequestUserId() userId: string, @Body() dto: CreateListingDto): Promise<EntityDto> {
        const command = CreateListingCommand.fromDto(dto, userId);
        return this._commandBus.execute(command);
    }

    @UseGuards(UserGuard)
    @Post("activate-listing")
    activate(@Body() dto: ActivateListingDto): Promise<EntityDto> {
        return this._commandBus.execute(new ActivateListingCommand(dto.blockNumber, dto.listingId, dto.chainListingId));
    }

    @UseGuards(UserGuard)
    @Post("submit-listing")
    submit(@Body() dto: SubmitListingDto): Promise<EntityDto> {
        return this._commandBus.execute(new SubmitListingCommand(dto.chainTransactionId, dto.listingId));
    }

    @UseGuards(UserGuard)
    @Post("buy-listing")
    buy(@RequestUserId() userId: string, @Body() dto: BuyListingDto): Promise<EntityDto> {
        return this._commandBus.execute(
            new BuyListingCommand(dto.listingId, userId, dto.chainTransactionHash, dto.blockNumber)
        );
    }

    @UseGuards(ClientGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Get("get-active-listings")
    getActiveListings(@Query() queryParams: PaginationDto): Promise<PageDto<ListingDto>> {
        return this._listingQueryHandler.getActiveListings(queryParams);
    }
}
