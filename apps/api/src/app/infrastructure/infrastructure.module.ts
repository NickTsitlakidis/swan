import { SourcedEvent } from "./sourced-event";
import { Aggregate } from "./aggregate";
import { CqrsModule } from "@nestjs/cqrs";
import { EventStoreConnector } from "./event-store-connector";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { IdGenerator } from "./id-generator";
import { QueueEventBus } from "./queue-event-bus";
import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { EventStore } from "./event-store";

export const INFRASTRUCTURE_DOCUMENTS: Array<any> = [SourcedEvent, Aggregate];

@Module({
    imports: [CqrsModule],
    providers: [EventStoreConnector, EventStore, IdGenerator, QueueEventBus, ExplorerService],
    exports: [EventStoreConnector, EventStore, IdGenerator, QueueEventBus]
})
export class InfrastructureModule implements OnApplicationBootstrap {
    constructor(private _eventBus: QueueEventBus, private _explorer: ExplorerService) {}

    onApplicationBootstrap(): any {
        const explored = this._explorer.explore();
        this._eventBus.register(explored.events);
    }
}