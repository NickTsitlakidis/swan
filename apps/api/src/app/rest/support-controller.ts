import { CategoryDto, BlockchainWalletDto } from "@nft-marketplace/common";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ClientGuard } from "../security/guards/client-guard";
import { SupportQueryHandler } from "../queries/support-query-handler";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

@Controller("support")
export class SupportController {
    constructor(private _queryHandler: SupportQueryHandler) {}

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

    @ApiOperation({ summary: "Returns all the available pairs of blockchain and wallet" })
    @ApiOkResponse({
        description: "An array of the pairs",
        type: BlockchainWalletDto,
        isArray: true
    })
    @Get("blockchain-wallets")
    @UseGuards(ClientGuard)
    getBlockchainWallets(): Promise<Array<BlockchainWalletDto>> {
        return this._queryHandler.getBlockchainWallets();
    }
}
