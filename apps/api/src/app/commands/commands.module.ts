import { BuyListingCommandExecutor } from "./listing/buy-listing-command-executor";
import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserModule } from "../domain/user/user.module";
import { ViewsModule } from "../views/views.module";
import { StartSignatureAuthenticationExecutor } from "./user/start-signature-authentication-executor";
import { CompleteSignatureAuthenticationExecutor } from "./user/complete-signature-authentication-executor";
import { SecurityModule } from "../security/security.module";
import { ConfigModule } from "@nestjs/config";
import { SignatureValidator } from "./user/signature-validator";
import { CompleteWalletAdditionCommandExecutor } from "./user/complete-wallet-addition-command-executor";
import { CollectionModule } from "../domain/collection/collection.module";
import { CreateCollectionCommandExecutor } from "./collection/create-collection-command-executor";
import { SupportModule } from "../support/support.module";
import { CreateNftCommandExecutor } from "./nft/create-nft-command-executor";
import { NftModule } from "../domain/nft/nft.module";
import { MintNftCommandExecutor } from "./nft/mint-nft-command-executor";
import { ListingModule } from "../domain/listing/listing.module";
import { CreateListingCommandExecutor } from "./listing/create-listing-command-executor";
import { SubmitListingCommandExecutor } from "./listing/submit-listing-command-executor";
import { ActivateListingCommandExecutor } from "./listing/activate-listing-command-executor";
import { ContractsModule } from "../contracts.module";

@Module({
    providers: [
        StartSignatureAuthenticationExecutor,
        CompleteSignatureAuthenticationExecutor,
        SignatureValidator,
        CompleteWalletAdditionCommandExecutor,
        CreateCollectionCommandExecutor,
        CreateNftCommandExecutor,
        MintNftCommandExecutor,
        CreateListingCommandExecutor,
        SubmitListingCommandExecutor,
        ActivateListingCommandExecutor,
        BuyListingCommandExecutor
    ],
    exports: [
        StartSignatureAuthenticationExecutor,
        CompleteSignatureAuthenticationExecutor,
        CompleteWalletAdditionCommandExecutor,
        CreateCollectionCommandExecutor,
        CreateNftCommandExecutor,
        MintNftCommandExecutor,
        CreateListingCommandExecutor,
        SubmitListingCommandExecutor,
        ActivateListingCommandExecutor,
        BuyListingCommandExecutor
    ],
    imports: [
        InfrastructureModule,
        UserModule,
        ViewsModule,
        SecurityModule,
        ConfigModule,
        CollectionModule,
        SupportModule,
        NftModule,
        ListingModule,
        ContractsModule
    ]
})
export class CommandsModule {}
