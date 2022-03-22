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

export const VIEW_DOCUMENTS = [UserView, WalletView, CategoryView];

@Module({
    imports: [InfrastructureModule],
    providers: [UserViewRepository, UserProjector, CategoryViewRepository, WalletProjector, WalletViewRepository],
    exports: [UserViewRepository, UserProjector, CategoryViewRepository, WalletProjector, WalletViewRepository]
})
export class ViewsModule {}
