import { Module } from "@nestjs/common";
import { SupportQueryHandler } from "./support-query-handler";
import { ViewsModule } from "../views/views.module";
import { CollectionQueryHandler } from "./collection-query-handler";
import { SupportModule } from "../support/support.module";
import { UserQueryHandler } from "./user-query-handler";

@Module({
    imports: [ViewsModule, SupportModule],
    providers: [SupportQueryHandler, CollectionQueryHandler, UserQueryHandler],
    exports: [SupportQueryHandler, CollectionQueryHandler, UserQueryHandler]
})
export class QueriesModule {}
