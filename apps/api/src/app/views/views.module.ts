import { UserView } from "./user/user-view";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserViewRepository } from "./user/user-view-repository";
import { Module } from "@nestjs/common";
import { UserProjector } from "./user/user-projector";

export const VIEW_DOCUMENTS = [UserView];

@Module({
    imports: [InfrastructureModule],
    providers: [UserViewRepository, UserProjector],
    exports: [UserViewRepository, UserProjector]
})
export class ViewsModule {}
