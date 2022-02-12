import { Moment } from "moment";
import { Expose, Transform, Type } from "class-transformer";
import * as moment from "moment";
import { IEvent } from "@nestjs/cqrs";
import { isNil } from "lodash";

/**
 * Abstract base class to be used for domain events that will be included as payload in sourced events.
 */
export abstract class EventBase implements IEvent {
    @Type(() => Date)
    @Expose({ name: "occurredAt" })
    @Transform(({ value }) => (isNil(value) ? undefined : moment(value)), { toClassOnly: true })
    private readonly _occurredAt: Moment;

    @Expose({ name: "aggregateId" })
    private readonly _aggregateId: string;

    protected constructor(occurredAt: Moment, aggregateId: string) {
        this._occurredAt = occurredAt;
        this._aggregateId = aggregateId;
    }

    get occurredAt(): Moment {
        return this._occurredAt;
    }

    get aggregateId(): string {
        return this._aggregateId;
    }
}
