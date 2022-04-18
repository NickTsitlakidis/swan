import { UserView } from "./user/user-view";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserViewRepository } from "./user/user-view-repository";
import { Module } from "@nestjs/common";
import { UserProjector } from "./user/user-projector";
import { WalletView } from "./wallet/wallet-view";
import { WalletViewRepository } from "./wallet/wallet-view-repository";
import { WalletProjector } from "./wallet/wallet-projector";
import { CategoryViewRepository } from "./categories/category-view-repository";
import { CategoryView } from "./categories/category-view";
import { CollectionViewRepository } from "./collection/collection-view-repository";
import { CollectionView } from "./collection/collection-view";

export const VIEW_DOCUMENTS = [UserView, WalletView, CategoryView, CollectionView]; // todo ask

@Module({
    imports: [InfrastructureModule],
    providers: [UserViewRepository, UserProjector, CategoryViewRepository, WalletProjector, WalletViewRepository, CollectionViewRepository], // todo ask
    exports: [UserViewRepository, UserProjector, CategoryViewRepository, WalletProjector, WalletViewRepository, CollectionViewRepository]
})
export class ViewsModule {}
