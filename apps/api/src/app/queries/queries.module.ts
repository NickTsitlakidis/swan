import { Module } from "@nestjs/common";
import { SystemQueryHandler } from "./system-query-handler";
import { ViewsModule } from "../views/views.module";
import { CollectionQueryHandler } from "./collection-query-handler";
import { SupportModule } from "../support/support.module";

@Module({
    imports: [ViewsModule, SupportModule],
    providers: [SystemQueryHandler, CollectionQueryHandler],
    exports: [SystemQueryHandler, CollectionQueryHandler]
})
export class QueriesModule {}
