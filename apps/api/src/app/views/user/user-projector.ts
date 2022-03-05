import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserCreatedEvent } from "../../domain/user/user-created-event";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { UserView } from "./user-view";
import { UserViewRepository } from "./user-view-repository";

@EventsHandler(UserCreatedEvent)
export class UserProjector implements IEventHandler<UserCreatedEvent> {
    constructor(private readonly _repository: UserViewRepository) {}

    @LogAsyncMethod
    async handle(event: UserCreatedEvent): Promise<UserView> {
        const view = new UserView();
        view.id = event.aggregateId;
        view.walletAddress = event.walletAddress;

        return this._repository.save(view);
    }
}
