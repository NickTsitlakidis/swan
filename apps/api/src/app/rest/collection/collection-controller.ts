import { Controller, Query, Get, Headers, UseGuards } from "@nestjs/common";
import { CollectionDto } from "@nft-marketplace/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { UserGuard } from "../../security/guards/user-guard";
import { EventStore } from "../../infrastructure/event-store";
import { RequestUserId } from "../../security/request-user-id";
import { CollectionQueryHandler } from "../../queries/collection-query-handler";

@Controller("/collection")
export class CollectionController {
    constructor(private readonly _eventStore: EventStore, private _queryHandler: CollectionQueryHandler) {}

    @ApiOperation({summary: "Fetch a collection using it's own id"})
    @Get("/")
    @ApiOkResponse({
        description: "A user's collection",
        type: CollectionDto
    })

    @UseGuards(UserGuard)
    fetchCollection(@RequestUserId() userId: string, /*@Headers('Authorization') authorization: string,*/ @Query('id') id: string): object /*Promise<CollectionDto>*/ {
        console.log({userId, id})

        return this._queryHandler.fetchOneCollection(id);// this._issuer.issueWithCredentials(authorization);
        return {test: userId, id};// this._issuer.issueWithCredentials(authorization);
    }
}
