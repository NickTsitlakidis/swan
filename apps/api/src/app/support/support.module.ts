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
import { AwsService } from "./aws/aws-service";
import { MetaplexService } from "./metaplex/metaplex-service";
import { EvmActionsService } from "./blockchains/evm-actions-service";
import { SolanaActionsService } from "./blockchains/solana-actions-service";
import { BlockchainActionsRegistryService } from "./blockchains/blockchain-actions-registry-service";
import { MetadataValidator } from "./blockchains/metadata-validator";
import { HttpModule } from "@nestjs/axios";
import { ContractsModule } from "../contracts.module";
import { EvmContract } from "./evm-contracts/evm-contract";
import { EvmContractsRepository } from "./evm-contracts/evm-contracts-repository";
import { CovalentService } from "./blockchains/covalent-service";

@Module({
    imports: [
        ContractsModule,
        InfrastructureModule,
        HttpModule,
        ContractsModule,
        MikroOrmModule.forFeature([Category, Wallet, Blockchain, BlockchainWallet, EvmContract])
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
        CovalentService,
        SolanaActionsService,
        MetadataValidator,
        EvmContractsRepository
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
        CovalentService,
        SolanaActionsService,
        MetadataValidator,
        EvmContractsRepository
    ]
})
export class SupportModule {}
