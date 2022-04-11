import { SourcedEvent } from "./sourced-event";
import { Aggregate } from "./aggregate";
import { CqrsModule } from "@nestjs/cqrs";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { IdGenerator } from "./id-generator";
import { QueueEventBus } from "./queue-event-bus";
import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { EventStore } from "./event-store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const INFRASTRUCTURE_DOCUMENTS: Array<any> = [SourcedEvent, Aggregate];

@Module({
    imports: [CqrsModule],
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
