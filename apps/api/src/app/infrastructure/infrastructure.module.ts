import { CqrsModule } from "@nestjs/cqrs";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { IdGenerator } from "./id-generator";
import { QueueEventBus } from "./queue-event-bus";
import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { EventStore } from "./event-store";
import { ConfigModule } from "@nestjs/config";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Aggregate } from "./aggregate";
import { SourcedEvent } from "./sourced-event";

@Module({
    imports: [CqrsModule, ConfigModule, MikroOrmModule.forFeature([Aggregate, SourcedEvent])],
    providers: [EventStore, IdGenerator, QueueEventBus, ExplorerService],
    exports: [EventStore, IdGenerator, QueueEventBus]
})
export class InfrastructureModule implements OnApplicationBootstrap {
    constructor(private _eventBus: QueueEventBus, private _explorer: ExplorerService) {}

    onApplicationBootstrap() {
        const explored = this._explorer.explore();
        this._eventBus.register(explored.events);
    }
}
