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
import { UploaderService } from "./uploader/uploader-service";
import { SwanWalletService } from "./swan-wallet-service";
import { ConfigModule } from "@nestjs/config";
import { AwsService } from "./aws/aws-service";
import { MetaplexService } from "./metaplex/metaplex-service";

@Module({
    imports: [
        InfrastructureModule,
        ConfigModule,
        MikroOrmModule.forFeature([Category, Wallet, Blockchain, BlockchainWallet])
    ],
    providers: [
        CategoryRepository,
        WalletRepository,
        UploaderService,
        BlockchainRepository,
        BlockchainWalletRepository,
        SwanWalletService,
        AwsService,
        MetaplexService
    ],
    exports: [
        CategoryRepository,
        UploaderService,
        SwanWalletService,
        WalletRepository,
        BlockchainRepository,
        BlockchainWalletRepository,
        AwsService,
        MetaplexService
    ]
})
export class SupportModule {}
