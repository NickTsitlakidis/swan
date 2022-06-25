import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../../infrastructure/infrastructure.module";
import { NftFactory } from "./nft-factory";

@Module({
    imports: [InfrastructureModule],
    providers: [NftFactory],
    exports: [NftFactory]
})
export class NftModule {}