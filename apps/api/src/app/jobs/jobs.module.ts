import { ConfigService } from "@nestjs/config";
import { AgendaModule, AgendaModuleOptions } from "@agent-ly/nestjs-agenda";
import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { ListingModule } from "../domain/listing/listing.module";
import { CancelEvmListingsJob } from "./cancel-evm-listings-job";

const agendaFactory = async (configService: ConfigService): Promise<AgendaModuleOptions> => {
    return {
        db: { address: configService.get("MONGO_SAFE_URI") },
        defaultConcurrency: 1,
        defaultLockLimit: 1
    };
};

@Module({
    imports: [
        AgendaModule.forRootAsync({
            inject: [ConfigService],
            useFactory: agendaFactory
        }),
        InfrastructureModule,
        ListingModule
    ],
    providers: [CancelEvmListingsJob]
})
export class JobsModule {}
