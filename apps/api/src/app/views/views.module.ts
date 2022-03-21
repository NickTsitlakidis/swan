import { UserView } from "./user/user-view";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserViewRepository } from "./user/user-view-repository";
import { Module } from "@nestjs/common";
import { UserProjector } from "./user/user-projector";
import { WalletView } from "./wallet/wallet-view";
import { WalletViewRepository } from "./wallet/wallet-view-repository";
import { WalletProjector } from "./wallet/wallet-projector";

export const VIEW_DOCUMENTS = [UserView, WalletView];

@Module({
    imports: [InfrastructureModule],
    providers: [UserViewRepository, UserProjector, WalletViewRepository, WalletProjector],
    exports: [UserViewRepository, UserProjector, WalletViewRepository, WalletProjector]
})
export class ViewsModule {}
