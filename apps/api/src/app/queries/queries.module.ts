import { Module } from "@nestjs/common";
import { SystemQueryHandler } from "./system-query-handler";
import { ViewsModule } from "../views/views.module";
import { CollectionQueryHandler } from "./collection-query-handler";

@Module({
    imports: [ViewsModule],
    providers: [SystemQueryHandler, CollectionQueryHandler],
    exports: [SystemQueryHandler, CollectionQueryHandler]
})
export class QueriesModule {}
