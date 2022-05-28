import { UserView } from "./user/user-view";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserViewRepository } from "./user/user-view-repository";
import { Module } from "@nestjs/common";
import { UserProjector } from "./user/user-projector";
import { WalletView } from "./wallet/wallet-view";
import { WalletViewRepository } from "./wallet/wallet-view-repository";
import { WalletProjector } from "./wallet/wallet-projector";
import { CategoryRepository } from "../support/categories/category-repository";
import { Category } from "../support/categories/category";
import { CollectionView } from "./collection/collection-view";
import { CollectionViewRepository } from "./collection/collection-view-repository";
import { CollectionProjector } from "./collection/collection-projector";

export const VIEW_DOCUMENTS = [UserView, WalletView, Category, CollectionView];

@Module({
    imports: [InfrastructureModule],
    providers: [
        UserViewRepository,
        UserProjector,
        CategoryRepository,
        WalletProjector,
        WalletViewRepository,
        CollectionViewRepository,
        CollectionProjector
    ],
    exports: [UserViewRepository, CategoryRepository, WalletViewRepository, CollectionViewRepository]
})
export class ViewsModule {}
