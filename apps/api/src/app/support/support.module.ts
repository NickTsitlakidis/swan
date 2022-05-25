import { Category } from "./categories/category";
import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { CategoryRepository } from "./categories/category-repository";
import { Wallet } from "./blockchains/wallet";
import { Blockchain } from "./blockchains/blockchain";
import { BlockchainWallet } from "./blockchains/blockchain-wallet";

export const SUPPORT_DOCUMENTS = [Category, Wallet, Blockchain, BlockchainWallet];

@Module({
    imports: [InfrastructureModule],
    providers: [
        CategoryRepository
    ],
    exports: [CategoryRepository]
})
export class SupportModule {}