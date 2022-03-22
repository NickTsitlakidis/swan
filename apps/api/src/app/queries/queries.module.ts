import { Module } from "@nestjs/common";
import { SystemQueryHandler } from "./system-query-handler";
import { ViewsModule } from "../views/views.module";

@Module({
    imports: [ViewsModule],
    providers: [SystemQueryHandler],
    exports: [SystemQueryHandler]
})
export class QueriesModule {}
