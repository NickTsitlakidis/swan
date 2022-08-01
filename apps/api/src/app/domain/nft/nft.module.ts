import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../../infrastructure/infrastructure.module";
import { SupportModule } from "../../support/support.module";
import { NftFactory } from "./nft-factory";

@Module({
    imports: [InfrastructureModule, SupportModule],
    providers: [NftFactory],
    exports: [NftFactory]
})
export class NftModule {}
