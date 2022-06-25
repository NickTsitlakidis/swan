import { Category } from "./categories/category";
import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { CategoryRepository } from "./categories/category-repository";
import { Wallet } from "./blockchains/wallet";
import { Blockchain } from "./blockchains/blockchain";
import { BlockchainWallet } from "./blockchains/blockchain-wallet";
import { WalletRepository } from "./blockchains/wallet-repository";
import { BlockchainRepository } from "./blockchains/blockchain-repository";
import { BlockchainWalletRepository } from "./blockchains/blockchain-wallet-repository";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
    imports: [InfrastructureModule, MikroOrmModule.forFeature([Category, Wallet, Blockchain, BlockchainWallet])],
    providers: [CategoryRepository, WalletRepository, BlockchainRepository, BlockchainWalletRepository],
    exports: [CategoryRepository, WalletRepository, BlockchainRepository, BlockchainWalletRepository]
})
export class SupportModule {}
