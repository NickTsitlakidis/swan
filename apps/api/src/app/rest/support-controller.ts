import { CategoryDto, BlockchainWalletDto, EvmContractDto } from "@swan/dto";
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

    @Get("evm-marketplace-contracts")
    @UseGuards(ClientGuard)
    getEvmMarketplaceContracts(): Promise<Array<EvmContractDto>> {
        return this._queryHandler.getEvmMarketplaceContracts();
    }

    @Get("evm-erc721-contracts")
    @UseGuards(ClientGuard)
    getEvmErc721Contracts(): Promise<Array<EvmContractDto>> {
        return this._queryHandler.getEvmErc721Contracts();
    }
}
