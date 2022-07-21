import { UserView } from "./user/user-view";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserViewRepository } from "./user/user-view-repository";
import { Module } from "@nestjs/common";
import { UserProjector } from "./user/user-projector";
import { UserWalletView } from "./user-wallet/user-wallet-view";
import { UserWalletViewRepository } from "./user-wallet/user-wallet-view-repository";
import { UserWalletProjector } from "./user-wallet/user-wallet-projector";
import { CategoryRepository } from "../support/categories/category-repository";
import { CollectionView } from "./collection/collection-view";
import { CollectionViewRepository } from "./collection/collection-view-repository";
import { CollectionProjector } from "./collection/collection-projector";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { NftProjector } from "./nft/nft-projector";
import { NftViewRepository } from "./nft/nft-view-repository";
import { NftView } from "./nft/nft-view";

@Module({
    imports: [InfrastructureModule, MikroOrmModule.forFeature([UserView, UserWalletView, NftView, CollectionView])],
    providers: [
        UserViewRepository,
        UserProjector,
        CategoryRepository,
        UserWalletProjector,
        UserWalletViewRepository,
        CollectionViewRepository,
        CollectionProjector,
        NftViewRepository,
        NftProjector
    ],
    exports: [
        UserViewRepository,
        CategoryRepository,
        UserWalletViewRepository,
        CollectionViewRepository,
        NftViewRepository
    ]
})
export class ViewsModule {}
