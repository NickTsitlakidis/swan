import { CategoryDto, BlockchainWalletDto } from "@swan/dto";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ClientGuard } from "../security/guards/client-guard";
import { SupportQueryHandler } from "../queries/support-query-handler";

@Controller("support")
export class SupportController {
    constructor(private _queryHandler: SupportQueryHandler) {}

    @Get("categories")
    @UseGuards(ClientGuard)
    getCategories(): Promise<Array<CategoryDto>> {
        return this._queryHandler.getCategories();
    }

    @Get("blockchain-wallets")
    @UseGuards(ClientGuard)
    getBlockchainWallets(): Promise<Array<BlockchainWalletDto>> {
        return this._queryHandler.getBlockchainWallets();
    }
}
