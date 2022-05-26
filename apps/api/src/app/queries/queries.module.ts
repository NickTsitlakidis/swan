import { Module } from "@nestjs/common";
import { SupportQueryHandler } from "./support-query-handler";
import { ViewsModule } from "../views/views.module";
import { CollectionQueryHandler } from "./collection-query-handler";
import { SupportModule } from "../support/support.module";

@Module({
    imports: [ViewsModule, SupportModule],
    providers: [SupportQueryHandler, CollectionQueryHandler],
    exports: [SupportQueryHandler, CollectionQueryHandler]
})
export class QueriesModule {}
