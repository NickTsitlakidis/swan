import { InternalServerErrorException } from "@nestjs/common";

export class AggregateConcurrencyException extends InternalServerErrorException {
    constructor(aggregateId: string, expectedVersion: number, databaseVersion: number) {
        super(`Concurrency issue for aggregate ${aggregateId}. Expected ${expectedVersion}. Stored ${databaseVersion}`);
    }
}
