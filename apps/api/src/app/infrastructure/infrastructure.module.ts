import { CqrsModule } from "@nestjs/cqrs";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { IdGenerator } from "./id-generator";
import { QueueEventBus } from "./queue-event-bus";
import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { EventStore } from "./event-store";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [CqrsModule, ConfigModule],
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
