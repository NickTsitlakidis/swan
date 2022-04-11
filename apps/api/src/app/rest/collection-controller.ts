import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AvailabilityDto, CreateCollectionDto, EntityDto } from "@nft-marketplace/common";
import { UserGuard } from "../security/guards/user-guard";
import { CollectionQueryHandler } from "../queries/collection-query-handler";
import { ApiOkResponse } from "@nestjs/swagger";
import { RequestUserId } from "../security/request-user-id";
import { instanceToPlain, plainToClass } from "class-transformer";
import { CreateCollectionCommand } from "../commands/collection/create-collection-command";
import { CommandBus } from "@nestjs/cqrs";

@Controller("collections")
export class CollectionController {
    constructor(private _collectionQueryHandler: CollectionQueryHandler, private _commandBus: CommandBus) {}

    @ApiOkResponse({ type: AvailabilityDto })
    @UseGuards(UserGuard)
    @Get("name-availability")
    checkNameAvailability(@Query("name") name: string): Promise<AvailabilityDto> {
        return this._collectionQueryHandler.getNameAvailability(name);
    }

    @ApiOkResponse({ type: AvailabilityDto })
    @UseGuards(UserGuard)
    @Get("url-availability")
    checkUrlAvailability(@Query("url") url: string): Promise<AvailabilityDto> {
        return this._collectionQueryHandler.getUrlAvailability(url);
    }

    @ApiOkResponse({ type: EntityDto })
    @UseGuards(UserGuard)
    @Post("create-collection")
    create(@RequestUserId() userId: string, @Body() dto: CreateCollectionDto): Promise<EntityDto> {
        const command = plainToClass(CreateCollectionCommand, instanceToPlain(dto));
        command.userId = userId;
        return this._commandBus.execute(command);
    }
}
