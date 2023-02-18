import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AvailabilityDto, CollectionDto, CreateCollectionDto, EntityDto } from "@swan/dto";
import { UserGuard } from "../security/guards/user-guard";
import { CollectionQueryHandler } from "../queries/collection-query-handler";
import { RequestUserId } from "../security/request-user-id";
import { CreateCollectionCommand } from "../commands/collection/create-collection-command";
import { CommandBus } from "@nestjs/cqrs";
import { ClientGuard } from "../security/guards/client-guard";

@Controller("collections")
export class CollectionController {
    constructor(private _collectionQueryHandler: CollectionQueryHandler, private _commandBus: CommandBus) {}

    @UseGuards(UserGuard)
    @Get("name-availability")
    checkNameAvailability(@Query("name") name: string): Promise<AvailabilityDto> {
        return this._collectionQueryHandler.getNameAvailability(name);
    }

    @UseGuards(UserGuard)
    @Get("url-availability")
    checkUrlAvailability(@Query("url") url: string): Promise<AvailabilityDto> {
        return this._collectionQueryHandler.getUrlAvailability(url);
    }

    @UseGuards(UserGuard)
    @Post("create-collection")
    create(@RequestUserId() userId: string, @Body() dto: CreateCollectionDto): Promise<EntityDto> {
        const command = CreateCollectionCommand.fromDto(dto);
        command.userId = userId;
        return this._commandBus.execute(command);
    }

    @UseGuards(UserGuard)
    @Get("get-user-collection")
    fetchUserCollection(@RequestUserId() userId: string): Promise<CollectionDto[]> {
        return this._collectionQueryHandler.getCollectionByUserId(userId);
    }

    @Get("/")
    @UseGuards(ClientGuard)
    fetchCollection(@Query("id") id: string): Promise<CollectionDto | undefined> {
        return this._collectionQueryHandler.getById(id);
    }
}
