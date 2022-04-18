import { Module } from "@nestjs/common";
import { SystemQueryHandler } from "./system-query-handler";
import { CollectionQueryHandler } from "./collection-query-handler";
import { ViewsModule } from "../views/views.module";

@Module({
    imports: [ViewsModule],
    providers: [SystemQueryHandler, CollectionQueryHandler], // todo ask gt kai providers ?
    exports: [SystemQueryHandler, CollectionQueryHandler]
})
export class QueriesModule {}
