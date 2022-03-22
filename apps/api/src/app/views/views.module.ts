import { UserView } from "./user/user-view";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserViewRepository } from "./user/user-view-repository";
import { Module } from "@nestjs/common";
import { UserProjector } from "./user/user-projector";
import { CategoryViewRepository } from "./categories/category-view-repository";
import { CategoryView } from "./categories/category-view";

export const VIEW_DOCUMENTS = [UserView, CategoryView];

@Module({
    imports: [InfrastructureModule],
    providers: [UserViewRepository, UserProjector, CategoryViewRepository],
    exports: [UserViewRepository, UserProjector, CategoryViewRepository]
})
export class ViewsModule {}
