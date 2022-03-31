import { CategoryDto } from "@nft-marketplace/common";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ClientGuard } from "../security/guards/client-guard";
import { SystemQueryHandler } from "../queries/system-query-handler";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

@Controller("system")
export class SystemController {
    constructor(private _queryHandler: SystemQueryHandler) {}

    @ApiOperation({ summary: "Returns all the available categories" })
    @ApiOkResponse({
        description: "An array of the categories",
        type: CategoryDto,
        isArray: true
    })
    @Get("categories")
    @UseGuards(ClientGuard)
    getCategories(): Promise<Array<CategoryDto>> {
        return this._queryHandler.getCategories();
    }
}
