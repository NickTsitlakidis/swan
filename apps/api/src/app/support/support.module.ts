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
import { ConfigModule } from "@nestjs/config";
import { AwsService } from "./aws/aws-service";
import { MetaplexService } from "./metaplex/metaplex-service";
import { EvmActionsService } from "./blockchains/evm-actions-service";
import { SolanaActionsService } from "./blockchains/solana-actions-service";
import { BlockchainActionsRegistryService } from "./blockchains/blockchain-actions-registry-service";
import { MetadataValidator } from "./blockchains/metadata-validator";
import { HttpModule } from "@nestjs/axios";
import { ContractsModule } from "../contracts.module";

@Module({
    imports: [
        ContractsModule,
        InfrastructureModule,
        ConfigModule,
        HttpModule,
        ContractsModule,
        MikroOrmModule.forFeature([Category, Wallet, Blockchain, BlockchainWallet])
    ],
    providers: [
        CategoryRepository,
        WalletRepository,
        BlockchainRepository,
        BlockchainWalletRepository,
        AwsService,
        MetaplexService,
        EvmActionsService,
        BlockchainActionsRegistryService,
        SolanaActionsService,
        MetadataValidator
    ],
    exports: [
        CategoryRepository,
        WalletRepository,
        BlockchainRepository,
        BlockchainWalletRepository,
        AwsService,
        MetaplexService,
        EvmActionsService,
        BlockchainActionsRegistryService,
        SolanaActionsService,
        MetadataValidator
    ]
})
export class SupportModule {}
