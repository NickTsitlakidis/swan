import { Module } from "@nestjs/common";
import { SupportQueryHandler } from "./support-query-handler";
import { ViewsModule } from "../views/views.module";
import { CollectionQueryHandler } from "./collection-query-handler";
import { ListingQueryHandler } from "./listing-query-handler";
import { SupportModule } from "../support/support.module";
import { UserQueryHandler } from "./user-query-handler";
import { NftQueryHandler } from "./nft-query-handler";

@Module({
    imports: [ViewsModule, SupportModule],
    providers: [SupportQueryHandler, CollectionQueryHandler, UserQueryHandler, NftQueryHandler, ListingQueryHandler],
    exports: [SupportQueryHandler, CollectionQueryHandler, UserQueryHandler, NftQueryHandler, ListingQueryHandler]
})
export class QueriesModule {}
